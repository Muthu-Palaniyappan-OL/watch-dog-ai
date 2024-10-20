/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExclamationTriangle } from "react-icons/fa";
import { CAMS_API_URL, TRANSCRIPTS_API_URL } from "../../constants";
import { FaExclamationCircle, FaWalking, FaPaw } from 'react-icons/fa';

import { useToast } from "../../Toast/ToastContext";
interface Camera {
  id: number;
  name: string;
  url: string;
  live: boolean;
  email: string;
  monitoringStatus: boolean;
}
const getActivityIcon = (activityName) => {
  switch (activityName) {
    case 'unusual_activity':
      return <FaExclamationCircle className="text-red-500" />;
    case 'human_activity':
      return <FaWalking className="text-blue-500" />;
    case 'animal_activity':
      return <FaPaw className="text-green-500" />;
    default:
      return null;
  }
};
const styles = {
  th: {
    padding: '12px 15px',
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  noData: {
    padding: '12px 15px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    color: '#666',
  },
};

export default function FetchAllTranscripts() {
  const camIds = ['Cam01', 'Cam02', 'Cam03'];
  const [cameras, setCameras] = useState<Camera[]>([]);

  const [transcripts, setTranscripts] = useState([]);
  const [selectedCam, setSelectedCam] = useState({ id: 0 });
  const [activityName, setActivityName] = useState('unusual_activity');  // Default activity

  const [selectedCamId, setSelectedCamId] = useState<string>(camIds[0]);
  const [analyticsData, setAnalyticsData] = useState();
  const activities = [
    { name: 'unusual_activity', label: 'Unusual Activity' },
    { name: 'human_activity', label: 'Human Activity' },
    { name: 'animal_activity', label: 'Animal Activity' },
  ];


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
  const fetchTranscriptsData = async () => {
    try {
      const cameraId = selectedCam?.id || 0;
      const response = await axios.get(TRANSCRIPTS_API_URL + `${activityName}/${cameraId}`);

      if (response.data.length > 0) {
        setTranscripts(response.data);  // Store fetched transcripts
      } else {
        console.error('No transcripts found for this activity and camera.');
        addToast('No transcripts found for this activity and camera.', <FaExclamationTriangle />);
        setTranscripts([]);  // Reset or handle no data case
      }
    } catch (error) {
      console.error('Error fetching transcripts data:', error);
      addToast('Error fetching transcripts data. Try again later!', <FaExclamationTriangle />);
      setTranscripts([]);  // Reset or handle error case
    }
  };

  return (
    <div>
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
            onClick={fetchTranscriptsData}
            className="ml-6 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-md"

          >
            Get Transcripts
          </button>
        </div>
      </div>

      <h2>Transcripts for {activityName.replace('_', ' ')}</h2>

      {/* Button tabs for selecting activity */}
      <div style={{ marginBottom: '20px' }}>
        {activities.map((activity) => (
          <button
            key={activity.name}
            onClick={() => setActivityName(activity.name)}
            style={{
              padding: '10px 15px',
              margin: '5px',
              backgroundColor: activityName === activity.name ? '#4CAF50' : '#f0f0f0',
              color: activityName === activity.name ? '#fff' : '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >

            {activity.label}
          </button>
        ))}
      </div>

      {/* Table to display the transcripts */}
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
  <thead className="text-base text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-sky-400">
    <tr>
      <th scope="col" className="px-6 py-3">Frame Number</th>
      <th scope="col" className="px-6 py-3">Activity</th>
      <th scope="col" className="px-6 py-3">Context Notes</th>
    </tr>
  </thead>
  <tbody>
    {transcripts.length > 0 ? (
      transcripts.map((transcript, index) => (
        <tr key={index} className="odd:bg-white even:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 border-b border-gray-600">
          <th scope="row" className="px-6 py-4 font-medium text-base text-gray-900 whitespace-nowrap">
            {transcript.frame_number}
          </th>
          <td className="px-6 py-4 flex items-center">
            {getActivityIcon(activityName)} {/* Icon based on activity */}
            <span className="ml-2">{transcript[activityName]}</span>
          </td>
          <td className="px-6 py-4">{transcript.context_notes}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={3} className="px-6 py-4 text-center">No transcripts available</td>
      </tr>
    )}
  </tbody>
</table>

    </div>
  );
};


