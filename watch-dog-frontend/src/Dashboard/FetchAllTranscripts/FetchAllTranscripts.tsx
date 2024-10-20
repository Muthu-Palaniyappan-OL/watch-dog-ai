import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaExclamationCircle, FaWalking, FaPaw } from 'react-icons/fa';
import { CAMS_API_URL, TRANSCRIPTS_API_URL } from "../../constants";
import { useToast } from "../../Toast/ToastContext";

interface Camera {
  id: number;
  name: string;
  url: string;
  live: boolean;
  email: string;
  monitoringStatus: boolean;
}

const getActivityIcon = (activityName: string) => {
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

export default function FetchAllTranscripts() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCam, setSelectedCam] = useState<Camera | null>(null);
  
  const [unusualActivityTranscripts, setUnusualActivityTranscripts] = useState([]);
  const [humanActivityTranscripts, setHumanActivityTranscripts] = useState([]);
  const [animalActivityTranscripts, setAnimalActivityTranscripts] = useState([]);
  
  const [selectedActivity, setSelectedActivity] = useState('unusual_activity'); // Default activity
  const { addToast } = useToast();

  const activities = [
    { name: 'unusual_activity', label: 'Unusual Activity' },
    { name: 'human_activity', label: 'Human Activity' },
    { name: 'animal_activity', label: 'Animal Activity' },
  ];

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get(CAMS_API_URL);
        setCameras(response.data);
        if (response.data.length > 0) {
          setSelectedCam(response.data[0]);
          fetchAllTranscripts(response.data[0].id); // Fetch transcripts for the first camera by default
        }
      } catch (error) {
        console.error('Error fetching cameras:', error);
        addToast('Error fetching cameras. Try again later!', <FaExclamationTriangle />);
      }
    };
    fetchCameras();
  }, []);

  // Fetch data for all activities
  const fetchAllTranscripts = async (cameraId: number) => {
    try {
      const unusualResponse = await axios.get(`${TRANSCRIPTS_API_URL}unusual_activity/${cameraId}`);
      setUnusualActivityTranscripts(unusualResponse.data);

      const humanResponse = await axios.get(`${TRANSCRIPTS_API_URL}human_activity/${cameraId}`);
      setHumanActivityTranscripts(humanResponse.data);

      const animalResponse = await axios.get(`${TRANSCRIPTS_API_URL}animal_activity/${cameraId}`);
      setAnimalActivityTranscripts(animalResponse.data);

    } catch (error) {
      console.error('Error fetching transcripts:', error);
      addToast('Error fetching transcripts. Try again later!', <FaExclamationTriangle />);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCamera = cameras.find(camera => camera.id === parseInt(e.target.value));
    setSelectedCam(selectedCamera || null);
    if (selectedCamera) {
      fetchAllTranscripts(selectedCamera.id); // Fetch data when camera changes
    }
  };

  const getCurrentTranscripts = () => {
    switch (selectedActivity) {
      case 'unusual_activity':
        return unusualActivityTranscripts;
      case 'human_activity':
        return humanActivityTranscripts;
      case 'animal_activity':
        return animalActivityTranscripts;
      default:
        return [];
    }
  };

  return (
    <div>
      {/* Camera Selector */}
      <div className="flex justify-between mb-6">
        <div className="w-1/2">
          <label htmlFor="camId" className="block text-lg font-medium text-gray-700 mb-2">
            Select Camera :
          </label>
          <select
            id="camId"
            value={selectedCam ? selectedCam.id : ''}
            onChange={handleCameraChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name} (ID {camera.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Selector */}
      <div style={{ marginBottom: '20px' }}>
        {activities.map((activity) => (
          <button
            key={activity.name}
            onClick={() => setSelectedActivity(activity.name)}
            style={{
              padding: '10px 15px',
              margin: '5px',
              backgroundColor: selectedActivity === activity.name ? '#4CAF50' : '#f0f0f0',
              color: selectedActivity === activity.name ? '#fff' : '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {activity.label}
          </button>
        ))}
      </div>

      <h2>Transcripts for {selectedActivity.replace('_', ' ')}</h2>

      {/* Table to display transcripts */}
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
        <thead className="text-base text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-sky-400">
          <tr>
            <th scope="col" className="px-6 py-3">Frame Number</th>
            <th scope="col" className="px-6 py-3">Activity</th>
            <th scope="col" className="px-6 py-3">Context Notes</th>
          </tr>
        </thead>
        <tbody>
          {getCurrentTranscripts().length > 0 ? (
            getCurrentTranscripts().map((transcript, index) => (
              <tr key={index} className="odd:bg-white even:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 border-b border-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-base text-gray-900 whitespace-nowrap">
                  {transcript.frame_number}
                </th>
                <td className="px-6 py-4 flex items-center">
                  {getActivityIcon(selectedActivity)}
                  <span className="ml-2">{transcript[selectedActivity]}</span>
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
}
