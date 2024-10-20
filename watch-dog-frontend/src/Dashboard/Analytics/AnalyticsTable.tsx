import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Tab } from '@headlessui/react';  // Import Tailwind Tabs
import { FaUsers, FaCar, FaExclamationTriangle, FaDog, FaCrow, FaVideo } from "react-icons/fa"; // Importing relevant icons
import { CAMS_API_URL, ANALYTICS_API_URL } from "../../constants";
import axios from "axios";
import { useToast } from "../../Toast/ToastContext";

// Register all the chart components in Chart.js
Chart.register(...registerables);

interface Camera {
    id: number;
    name: string;
    url: string;
    live: boolean;
    email: string;
    monitoringStatus: boolean;
  }

interface AnalyticsData {
    total_footage_analyzed: number;
    total_individuals_detected: number;
    average_human_passerbys_per_footage: number;
    total_unusual_incidents: number;
    total_animal_incidents: number;
    total_unusual_crowd_incidents: number;
    total_vehicle_detected: number;
}

// Helper function for className in tabs
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const AnalyticsTable: React.FC = () => {
    // Example camId data
    const camIds = ['Cam01', 'Cam02', 'Cam03'];

    const [cameras, setCameras] = useState<Camera[]>([]);
    const [selectedCam, setSelectedCam] = useState<Camera | null>(null);

    const [selectedCamId, setSelectedCamId] = useState<string>(camIds[0]);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

    const { addToast } = useToast();

    useEffect(() => {
        const fetchCameras = async () => {
          try {
            const response = await axios.get(CAMS_API_URL);
            setCameras(response.data); // Assuming data is an array of cameras
            if (response.data.length > 0) {
                setSelectedCam(response.data[0]); // Set the first camera as selected if available
            }
          } catch (error) {
            console.error('Error fetching cameras:', error);
            addToast('Error fetching cameras. Try again Later!', <FaExclamationTriangle />);
          }
        };
        fetchCameras();
      }, []);

    // Mock data fetching function
    const fetchAnalyticsData = async () => {
        try {
            const cameraId = selectedCam?.id || 0; 
            const response = await axios.get(ANALYTICS_API_URL+`${cameraId}`);
            
            // Assuming the response data is an array and you want the first item
            if (response.data.length > 0) {
                const data: AnalyticsData = response.data[0];
                data.average_human_passerbys_per_footage = data.total_individuals_detected / data.total_footage_analyzed;
                 // Adjust based on your response structure
                setAnalyticsData(data);
            } else {
                console.error('No analytics data found for this camera.');
                addToast('No analytics data found for this camera.', <FaExclamationTriangle />);
                setAnalyticsData(null); // Reset or handle no data case
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            addToast('Error fetching analytics data. Try again Later!', <FaExclamationTriangle />);
            setAnalyticsData(null); // Reset or handle error case
        }
    };

    // Bar Chart Data
    const barChartData = analyticsData
        ? {
            labels: ["Total Footage", "Total Individuals", "Total Vehicles", "Unusual Incidents", "Animal Incidents"],
            datasets: [
                {
                    label: "Count",
                    data: [
                        analyticsData.total_footage_analyzed,
                        analyticsData.total_individuals_detected,
                        analyticsData.total_vehicle_detected,
                        analyticsData.total_unusual_incidents,
                        analyticsData.total_animal_incidents,
                    ],
                    backgroundColor: ["#3498db", "#1abc9c", "#f1c40f", "#e74c3c", "#9b59b6"],
                    borderColor: "#34495e",
                    borderWidth: 1,
                },
            ],
        }
        : null;

    // Pie Chart Data
    const pieChartData = analyticsData
        ? {
            labels: ["Unusual Incidents", "Animal Incidents", "Crowd Incidents"],
            datasets: [
                {
                    data: [
                        analyticsData.total_unusual_incidents,
                        analyticsData.total_animal_incidents,
                        analyticsData.total_unusual_crowd_incidents,
                    ],
                    backgroundColor: ["#e74c3c", "#3498db", "#f1c40f"],
                    hoverBackgroundColor: ["#c0392b", "#2980b9", "#f39c12"],
                },
            ],
        }
        : null;

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-5xl mx-auto mt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Analytics Summary</h2>

            {/* Camera ID Selector */}
            <div className="flex justify-between mb-6">
                <div className="w-1/2">
                    <label htmlFor="camId" className="block text-lg font-medium text-gray-700 mb-2">
                        Select Camera :
                    </label>
                    <select
                        id="camId"
                        value={selectedCam ? selectedCam.id : ''}
                        onChange={(e) => {
                            setAnalyticsData(null); 
                            const selectedCamera = cameras.find(camera => camera.id === parseInt(e.target.value)); // Use id for selection
                            setSelectedCam(selectedCamera || null); // Handle potential null case
                        }}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    >
                        {cameras.map((camera) => (
                            <option key={camera.id} value={camera.id}>
                                {camera.name} (ID {camera.id})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Fetch Button */}
                <div className="flex items-end">
                    <button
                        onClick={fetchAnalyticsData}
                        className="ml-6 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-md"
                        
                    >
                        Get Analytics
                    </button>
                </div>
            </div>

            {/* Display analytics if data is available */}
            {analyticsData && (
                <>
                    {/* Analytics Table */}
                    <table className="table-auto w-full text-left mb-10 border-t mt-4">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2">Metric</th>
                                <th className="px-4 py-2">Value</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr className="border-b">
                                <td className="px-4 py-2 flex items-center">
                                    <FaVideo className="mr-2 text-gray-500" />
                                    Average Human Passerbys per Footage
                                </td>
                                <td className="px-4 py-2">{analyticsData.average_human_passerbys_per_footage}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-4 py-2 flex items-center">
                                    <FaExclamationTriangle className="mr-2 text-gray-500" />
                                    Total Unusual Incidents
                                </td>
                                <td className="px-4 py-2">{analyticsData.total_unusual_incidents}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-4 py-2 flex items-center">
                                    <FaDog className="mr-2 text-gray-500" />
                                    Total Animal Incidents
                                </td>
                                <td className="px-4 py-2">{analyticsData.total_animal_incidents}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-4 py-2 flex items-center">
                                    <FaCrow className="mr-2 text-gray-500" />
                                    Total Unusual Crowd Incidents
                                </td>
                                <td className="px-4 py-2">{analyticsData.total_unusual_crowd_incidents}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-4 py-2 flex items-center">
                                    <FaCar className="mr-2 text-gray-500" />
                                    Total Vehicles Detected
                                </td>
                                <td className="px-4 py-2">{analyticsData.total_vehicle_detected}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Tabs for Charts */}
                    <Tab.Group>
                        <Tab.List className="flex space-x-4 mb-6 justify-center">
                            <Tab className={({ selected }) => classNames("px-6 py-2 text-base font-semibold rounded-lg", selected ? "bg-sky-500 text-white" : "text-gray-700 bg-gray-200")}>
                               Analytics Overview
                            </Tab>
                            <Tab className={({ selected }) => classNames("px-6 py-2 text-base font-semibold rounded-lg", selected ? "bg-sky-500 text-white" : "text-gray-700 bg-gray-200")}>
                                Incidents Breakdown
                            </Tab>
                        </Tab.List>

                        <Tab.Panels>
                            <Tab.Panel className="w-full h-[400px]">
                                {barChartData && <Bar data={barChartData} options={{ responsive: true }} />}
                            </Tab.Panel>

                            <Tab.Panel className="w-full h-[400px]">
                                {pieChartData && <Pie data={pieChartData} options={{ responsive: true }} />}
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </>
            )}
        </div>
    );
};

export default AnalyticsTable;
