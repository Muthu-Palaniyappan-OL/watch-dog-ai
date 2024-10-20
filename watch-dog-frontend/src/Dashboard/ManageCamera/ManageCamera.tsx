import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ADD_CAM_API_URL, CAMS_API_URL, EDIT_CAM_API_URL } from '../../constants';

import { useToast } from "../../Toast/ToastContext";
import { FaExclamationTriangle } from 'react-icons/fa';
import EditCamera from './EditCamera';
import { FcOk } from 'react-icons/fc';
import AddCamera from './AddCamera';

interface Camera {
  id:number;
  name: string;
  url: string;
  live: boolean;
  email: string;
  monitoringStatus: boolean;
}

const ManageCamera: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);  // State to track editing camera
  const [isAdding, setIsAdding] = useState<boolean>(false);  // State to manage add camera mode
  
  const { addToast } = useToast();

  // Function to toggle monitoring status for a specific camera
  const toggleMonitoring = (index: number) => {
    setCameras((prevCameras) =>
      prevCameras.map((camera, i) =>
        i === index ? { ...camera, monitoringStatus: !camera.monitoringStatus } : camera
      )
    );
  };

  const handleAddCamera = () => {
    setIsAdding(true);  // Open the Add Camera form
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);  // Set the camera to edit mode
  };

  const handleSaveCamera = async (updatedCamera: Camera) => {
    try {
      const response = await axios.put(EDIT_CAM_API_URL+`${updatedCamera.id}`, updatedCamera, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        setCameras((prevCameras) =>
          prevCameras.map((camera) =>
            camera.id === updatedCamera.id ? updatedCamera : camera
          )
        );
        addToast('Camera details updated successfully!', <FcOk />);
      } else {
        addToast('Failed to update camera details. Please try again.', <FaExclamationTriangle />);
      }
    } catch (error) {
      console.error('Error updating camera:', error);
      addToast('Error updating camera. Please try again later!', <FaExclamationTriangle />);
    } finally {
      setEditingCamera(null);  // Exit edit mode
    }
  };


  const handleAddNewCamera = async (newCamera: Camera) => {
    try {
      const response = await axios.post(ADD_CAM_API_URL, newCamera, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setCameras([...cameras, response.data]);  // Add the new camera to the list
        addToast('New camera added successfully!', <FcOk />);
        fetchCameras();
      } else {
        addToast('Failed to add new camera. Please try again.', <FaExclamationTriangle />);
      }
    } catch (error) {
      console.error('Error adding new camera:', error);
      addToast('Error adding new camera. Please try again later!', <FaExclamationTriangle />);
    } finally {
      setIsAdding(false);  // Exit add mode
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };


  const handleCancelEdit = () => {
    setEditingCamera(null);  // Exit edit mode
  };
  const fetchCameras = async () => {
    try {
      const response = await axios.get(CAMS_API_URL);
      setCameras(response.data);
      console.log('Cameras:', response.data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      addToast('Error fetching cameras. Try again Later!', <FaExclamationTriangle />);
    }
  };
  // Fetch cameras from the API
  useEffect(() => {
    
    fetchCameras();
  }, []);


  return (
    <>
      {editingCamera ? (
        <EditCamera
          camera={editingCamera}
          onSave={handleSaveCamera}
          onCancel={handleCancelEdit}
        />
      ) : isAdding ? (
        <AddCamera
          onSave={handleAddNewCamera}
          onCancel={handleCancelAdd}
        />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-700">
              Manage Cameras ({cameras.length})
            </h1>
            <button
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleAddCamera}
            >
              Add Camera
            </button>
          </div>

          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
              <thead className="text-base text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-sky-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Camera Name</th>
                  <th scope="col" className="px-6 py-3">Feed URL</th>
                  <th scope="col" className="px-6 py-3">Live Status</th>
                  <th scope="col" className="px-6 py-3">Alert E-Mail</th>
                  <th scope="col" className="px-6 py-3">Monitoring Status</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {cameras.map((camera, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 border-b border-gray-600">
                    <th scope="row" className="px-6 py-4 font-medium text-base text-gray-900 whitespace-nowrap">
                      {camera.name}
                    </th>
                    <td className="px-6 py-4">{camera.url}</td>
                    <td className="px-6 py-4">
                      {camera.live ? (
                        <span className="text-green-500 font-semibold">🔴 Live</span>
                      ) : (
                        <span className="text-red-500 font-semibold">⚫ Offline</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{camera.email}</td>
                    <td className="px-6 py-4">
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          camera.monitoringStatus ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}
                        onClick={() => toggleMonitoring(index)}
                      >
                        {camera.monitoringStatus ? 'Monitoring On' : 'Monitoring Off'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleEditCamera(camera)}
                        className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-base px-5 py-2.5 text-center"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageCamera;
