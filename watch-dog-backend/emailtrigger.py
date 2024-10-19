from langchain.chat_models import ChatOpenAI
import smtplib
# from langchain.schema import AIMessage, HumanMessage, SystemMessage
from email.message import EmailMessage
import json
import os 

from dotenv import load_dotenv

def process_activity(data):
    if "logic for processing":
    # Define email content
        formatted_details = format_activity_details(data)  # Format the data as a readable string
        
        email_body = f"Unusual activity detected:\n\n{data['unusual_activity']}\n\nAdditional details:\n\n{formatted_details}"
    
        email_subject = "Alert: Unusual Activity Detected in CCTV Footage"

        recipient_email = "d2552002@gmail.com"  # Replace with the actual recipient email
        
        # Send the email
        send_email(email_subject, email_body, recipient_email)

# Convert the content string to JSON
data = json.loads(content)

def send_email(subject, body, to_email):
    #Create the email message
    YOUR_GOOGLE_EMAIL = os.getenv('YOUR_GOOGLE_EMAIL')  # The email you setup to send the email using app password
    YOUR_GOOGLE_EMAIL_APP_PASSWORD = os.getenv('YOUR_GOOGLE_EMAIL')  # The app password you generated

    msg = EmailMessage()
    msg.set_content(body)
    msg['Subject'] = subject
    msg['From'] = YOUR_GOOGLE_EMAIL # Replace with your email
    msg['To'] = to_email

    smtpserver = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    smtpserver.ehlo()
    smtpserver.login(YOUR_GOOGLE_EMAIL, YOUR_GOOGLE_EMAIL_APP_PASSWORD)

    # Test send mail
    sent_from = YOUR_GOOGLE_EMAIL
    sent_to = to_email  #  Send it to self (as test)
    email_text = body
    smtpserver.send_message(msg)
    print('email sent')

    # Close the connection
    smtpserver.close()


