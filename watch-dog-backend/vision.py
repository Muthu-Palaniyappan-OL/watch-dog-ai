from email.message import EmailMessage
from email.mime.text import MIMEText
import requests
import base64
from dotenv import load_dotenv
import json
import cv2
from flask import current_app
from db import Alert, Camera, TranscriptDetailed, db, app, AnalyticsData
import os
import re
import smtplib


def image_path_to_image_b64(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def ndarray_to_image_b64(image_arr):
    _, buffer = cv2.imencode(".jpg", image_arr, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
    return base64.b64encode(buffer).decode("utf-8")


async def get_caption(image_b64, frame_number, camera_id):
    invoke_url = "https://ai.api.nvidia.com/v1/gr/meta/llama-3.2-90b-vision-instruct/chat/completions"
    stream = False
    api_token = os.getenv("NVIDIA_API_TOKEN")
    # Read the image and encode it to base64

    assert (
        len(image_b64) < 180_000
    ), "To upload larger images, use the assets API (see docs)"

    headers = {
        "Authorization": "Bearer " + api_token,
        "Accept": "text/event-stream" if stream else "application/json",
    }

    payload = {
        "model": "meta/llama-3.2-90b-vision-instruct",
        "messages": [
            {
                "role": "user",
                "content": f'Analyze this CCTV footage and generate an objective report in JSON format with the following fields: unusual_activity: Describe any unusual or suspicious activity observed, or respond with none if no such activity is detected. human_activity: Objectively describe human movements or behaviors observed in the footage, or respond with none if no human activity is detected. animal_activity: If any animals or birds are present, describe their movements or behaviors, or respond with none if no wildlife is detected. time: Specify whether the footage is captured during day or night based on lighting conditions. unusual_crowd: If there is an unusually large group of people, respond with unusual crowd, otherwise respond with none. lighting_conditions: Detail the lighting (e.g., well-lit, dim). vehicle_details: If vehicles are detected, describe them (e.g., red sedan). number_of_individuals: Provide the estimated number of people present (e.g., 3). object_presence: Describe any significant objects present (e.g., backpack left unattended). context_notes: Add any additional observations that provide context (e.g., event in progress). The output should be in valid JSON format only no extra words. <img src="data:image/png;base64,{image_b64}" />',
            }
        ],
        "max_tokens": 512,
        "temperature": 0.4,
        "top_p": 1.00,
        "stream": stream,
    }

    # Send POST request to the API
    response = requests.post(invoke_url, headers=headers, json=payload)

    if stream:
        # Handle streaming responses
        for line in response.iter_lines():
            if line:
                print(line.decode("utf-8"))
    else:
        # Parse the JSON response
        json_response = response.json()

        print(json_response)

        # Extract the content
        content = json_response["choices"][0]["message"]["content"]

        # Clean and parse the content into a dictionary
        try:
            # Convert string content to dictionary
            cleaned_output = json.loads(content)
            cleaned_output["number_of_individuals"] = (
                int(re.findall(r"\d+", cleaned_output["number_of_individuals"])[0])
                if re.findall(r"\d+", cleaned_output["number_of_individuals"])
                else 0
            )

            with app.app_context():
                try:
                    # {"unusual_activity": "none", "human_activity": "People walking on the sidewalk, some carrying bags or backpacks. A few individuals are standing near the street, possibly waiting for something or someone.", "animal_activity": "none", "time": "day", "unusual_crowd": "none", "lighting_conditions": "well-lit", "vehicle_details": "none", "number_of_individuals": "approximately 10-15", "object_presence": "none", "context_notes": "The scene appears to be a typical urban setting with people going about their daily business. There are no visible signs of distress or unusual behavior among the individuals present."}
                    data = TranscriptDetailed()
                    data.camera_id = camera_id
                    data.frame_number = frame_number
                    data.unusual_activity = cleaned_output["unusual_activity"]
                    data.human_activity = cleaned_output["human_activity"]
                    data.animal_activity = cleaned_output["animal_activity"]
                    data.time = cleaned_output["time"]
                    data.unusual_crowd = cleaned_output["unusual_crowd"]
                    data.lighting_conditions = cleaned_output["lighting_conditions"]
                    data.vehicle_details = cleaned_output["vehicle_details"]
                    data.number_of_individuals = cleaned_output["number_of_individuals"]
                    data.object_presence = cleaned_output["object_presence"]
                    data.context_notes = cleaned_output["context_notes"]
                    db.session.add(data)
                    db.session.commit()
                    update_analytics_table(cleaned_output, camera_id)
                    create_alert(cleaned_output, camera_id, frame_number)
                except Exception as e:
                    db.session.rollback()  # Rollback the session in case of error
                    print(f"Error: {e}")

            return cleaned_output
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return {}


def update_analytics_table(cleaned_output, camera_id):
    # Prepare data to insert/update
    total_individuals = int(cleaned_output["number_of_individuals"])
    total_vehicle_detected = len(
        cleaned_output["vehicle_details"].split(",")
    )  # Count vehicles
    total_unusual_incidents = int(cleaned_output["unusual_activity"] != "none")

    # Create a new session
    session = db.session

    try:
        # Check if the entry for the given cam_id exists
        analytics_entry = (
            session.query(AnalyticsData).filter_by(camera_id=camera_id).first()
        )

        if analytics_entry:
            # If exists, update the fields
            analytics_entry.total_footage_analyzed += 1  # Incrementing footage analyzed
            analytics_entry.total_individuals_detected += total_individuals
            analytics_entry.average_human_passerbys_per_footage = (
                analytics_entry.average_human_passerbys_per_footage + total_individuals
            ) / analytics_entry.total_footage_analyzed  # Adjust as needed
            analytics_entry.total_unusual_incidents += int(
                cleaned_output["unusual_activity"] != "none"
            )  # Update this based on your logic
            analytics_entry.total_animal_incidents += int(
                cleaned_output["animal_activity"] != "none"
            )
            analytics_entry.total_unusual_crowd_incidents += int(
                cleaned_output["unusual_crowd"] != "none"
            )
            analytics_entry.total_vehicle_detected += total_vehicle_detected

        else:
            # If not exists, create a new entry with zeros in fields except for cam_id
            new_entry = AnalyticsData(
                camera_id=camera_id,
                total_footage_analyzed=1,  # This is the first footage analyzed
                total_individuals_detected=total_individuals,
                average_human_passerbys_per_footage=total_individuals,  # Starting value
                total_unusual_incidents=total_unusual_incidents,  # Adjust based on your logic
                total_animal_incidents=int(cleaned_output["animal_activity"] != "none"),
                total_unusual_crowd_incidents=int(
                    cleaned_output["unusual_crowd"] != "none"
                ),
                total_vehicle_detected=total_vehicle_detected,
            )
            session.add(new_entry)

        # Commit the session to save changes
        session.commit()
        print("Analytics data updated successfully.")
    except Exception as e:
        session.rollback()  # Rollback in case of error
        print(f"Error updating analytics data: {e}")
    finally:
        session.close()  # Close the session


def create_alert(cleaned_output, camera_id, frame_number):
    alerts_list = []

    if cleaned_output["human_activity"] != "none":
        alert = Alert(
            camera_id=camera_id,
            frame_number=frame_number,
            alert_type="Human Activity",
            description=f"human_activity detected: {cleaned_output['human_activity']}",
        )
        db.session.add(alert)
        alerts_list.append(alert.description)

    if cleaned_output["unusual_activity"] != "none":
        alert = Alert(
            camera_id=camera_id,
            frame_number=frame_number,
            alert_type="Unusual Activity",
            description=f"Unusual activity detected: {cleaned_output['unusual_activity']}",
        )
        db.session.add(alert)
        alerts_list.append(alert.description)

    if cleaned_output["animal_activity"] != "none":
        alert = Alert(
            camera_id=camera_id,
            frame_number=frame_number,
            alert_type="Animal Activity",
            description=f"Animal activity detected: {cleaned_output['animal_activity']}",
        )
        db.session.add(alert)
        alerts_list.append(alert.description)

    if cleaned_output["unusual_crowd"] != "none":
        alert = Alert(
            camera_id=camera_id,
            frame_number=frame_number,
            alert_type="Unusual Crowd Activity",
            description=f"Unusual crowd activity detected: {cleaned_output['unusual_crowd']}",
        )
        db.session.add(alert)
        alerts_list.append(alert.description)

    # Commit if any alert was created
    if alerts_list:
        db.session.commit()
        print("Alerts created successfully.")
        print("Send mail.")
        send_alert_email(camera_id, cleaned_output)  # Send email with alerts
    else:
        print("No alerts to create.")


# def send_alert_email(camera_id, alerts):
#     # Email configuration
#     sender_email = os.getenv("YOUR_GOOGLE_EMAIL")
#     camera = Camera.query.filter_by(id=camera_id).first()
#     receiver_email = camera.email
#     subject = f"Alerts for Camera ID: {camera_id}"
#     body = "The following alerts have been generated:\n\n" + "\n".join(alerts)

#     # Create the email message
#     msg = MIMEText(body)
#     msg["Subject"] = subject
#     msg["From"] = sender_email
#     msg["To"] = receiver_email

#     print(sender_email, receiver_email)

#     try:
#         # Send the email
#         with smtplib.SMTP(
#             "smtp.google.com", 587
#         ) as server:  # Use your SMTP server and port
#             server.ehlo()
#             server.starttls()  # Upgrade the connection to a secure encrypted SSL/TLS connection
#             server.login(
#                 sender_email, os.environ("YOUR_GOOGLE_EMAIL_APP_PASSWORD")
#             )  # Login credentials for your email
#             server.send_message(msg)
#             print("Alert email sent successfully.")
#     except Exception as e:
#         print(f"Failed to send email: {e}")


def send_alert_email(camera_id, cleaned_output):
    camera = Camera.query.filter_by(id=camera_id).first()

    # Prepare the alerts and their corresponding images
    alerts_list = []
    images = {
        "human activity": "https://img.freepik.com/free-photo/front-view-smiley-man-pointing-side_23-2148946252.jpg ",
        "Unusual Activity": "https://www.voisins78.fr/images/images/culture-sport/culture/sherlock.jpg",
        "Animal Activity": "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg",
        "Unusual Crowd Activity": "https://media.istockphoto.com/id/1400020345/vector/women.jpg",
    }

    # Check for alerts and build alerts_list
    if cleaned_output["human_activity"] != "none":
        alerts_list.append(
            f"Human activity detected: {cleaned_output['human_activity']}"
        )

    if cleaned_output["unusual_activity"] != "none":
        alerts_list.append(
            f"Unusual activity detected: {cleaned_output['unusual_activity']}"
        )

    if cleaned_output["animal_activity"] != "none":
        alerts_list.append(
            f"Animal activity detected: {cleaned_output['animal_activity']}"
        )

    if cleaned_output["unusual_crowd"] != "none":
        alerts_list.append(
            f"Unusual crowd activity detected: {cleaned_output['unusual_crowd']}"
        )

    # Render HTML for email
    alert_html = ""
    for alert in alerts_list:
        alert_type = alert.split(":")[0]  # Extract alert type from description
        image_src = images.get(alert_type, "")  # Get corresponding image
        alert_html += f"""
        <tr style="vertical-align: middle;">
            <td align="center" class="content">
                <p>{alert}</p>
                <img src="{image_src}" alt="{alert_type}" class="image" />
            </td>
        </tr>
        """

    html_template = f"""
    <!DOCTYPE html>
    <html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="color-scheme:light dark;supported-color-schemes:light dark;">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1 user-scalable=yes">
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
        <meta name="x-apple-disable-message-reformatting">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Alert Notification</title>
        <style>
            a[x-apple-data-detectors] {{
                color: inherit!important;
                text-decoration: none!important;
                font-size: inherit!important;
                font-family: inherit!important;
                font-weight: inherit!important;
                line-height: inherit!important;
            }}
            tr {{
                vertical-align: middle;
            }}
            p, a, li {{
                color: #000000;
                font-size: 16px;
                line-height: 24px;
                font-family: Arial, sans-serif;
            }}
            .alert {{
                vertical-align: top;
                color: #fff;
                font-weight: 500;
                text-align: center;
                border-radius: 3px 3px 0 0;
                background-color: #FF9F00;
                margin: 0;
                padding: 20px;
            }}
            .content {{
                background-color: #fffffe;
                padding: 30px;
            }}
            .image {{
                max-width: 100%;
                height: auto;
            }}
            @media only screen and (max-width: 599px) {{
                .full-width-mobile {{
                    width: 100%!important;
                    height: auto!important;
                }}
                .mobile-padding {{
                    padding-left: 10px!important;
                    padding-right: 10px!important;
                }}
            }}
            @media (prefers-color-scheme: dark) {{
                body, div, table, td {{
                    background-color: #000000!important;
                    color: #ffffff!important;
                }}
                p, li, .white-text {{
                    color: #B3BDC4!important;
                }}
                a {{
                    color: #84cfe2!important;
                }}
            }}
        </style>
    </head>
    <body class="body" style="background-color: #f4f4f4;">
        <div style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;"></div>
        <div role="article" aria-roledescription="email" aria-label="Alert Notification" lang="en" dir="ltr" style="font-size: 16px; background-color: #f4f4f4;">
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; max-width: 600px; background-color: #f4f4f4;">
                <tr style="vertical-align: middle;">
                    <td>
                        <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; max-width: 600px; width: 100%; background-color: #fffffe;">
                            <tr style="vertical-align: middle;">
                                <td align="center" class="alert">
                                    <p style="margin: 0;">Alert Notification for Camera ID: <strong>{camera_id}</strong></p>
                                </td>
                            </tr>
                            <tr style="vertical-align: middle;">
                                <td align="center" class="content">
                                    <p style="margin-top: 0;">The following alerts have been generated based on the footage analysis:</p>
                                    <ul style="list-style-type: none; padding: 0;">
                                        {"".join(f"<li>{alert}</li>" for alert in alerts_list)}
                                    </ul>
                                </td>
                            </tr>
                            {alert_html}  <!-- Insert the alert rows with images -->
                            <tr style="vertical-align: middle;">
                                <td align="center" class="content">
                                    <img src="https://backend.stream/watchdog.svg" height="100" />
                                    <p style="color: #999; font-size: 14px; margin-top: 30px;">Thank you for using Watch Dogs AI (Built for Lablabai Edgerunner 3.2 Hackathon).</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """

    # Create the email message
    YOUR_GOOGLE_EMAIL = "edgerunners2024@gmail.com"  # Replace with your email
    YOUR_GOOGLE_EMAIL_APP_PASSWORD = "kdtscdbcguepyklq"  # Your app password

    msg = EmailMessage()
    msg.set_content(
        "This email requires an HTML viewer."
    )  # Fallback for email clients that don't support HTML
    msg.add_alternative(html_template, subtype="html")  # Set HTML content
    msg["Subject"] = "Alert Notification"
    msg["From"] = YOUR_GOOGLE_EMAIL
    msg["To"] = camera.email

    # Send the email
    smtpserver = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    smtpserver.ehlo()
    smtpserver.login(YOUR_GOOGLE_EMAIL, YOUR_GOOGLE_EMAIL_APP_PASSWORD)

    # Send mail
    smtpserver.send_message(msg)
    print("Email sent")

    # Close the connection
    smtpserver.close()
