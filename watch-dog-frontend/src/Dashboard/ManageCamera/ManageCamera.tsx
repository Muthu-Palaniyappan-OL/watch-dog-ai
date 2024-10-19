import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CAMS_API_URL } from '../../constants';

interface Camera {
  name: string;
  url: string;
  live: boolean;
  email: string;
  monitoringStatus: boolean;
}

const ManageCamera: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);


  // Function to toggle monitoring status for a specific camera
  const toggleMonitoring = (index: number) => {
    setCameras((prevCameras) =>
      prevCameras.map((camera, i) =>
        i === index ? { ...camera, monitoringStatus: !camera.monitoringStatus } : camera
      )
    );
  };

  const handleAddCamera= () =>{
    alert("Adding New Camera!");


  };

  const handleEditCamera=(camera: Camera) =>{
    alert("Editing Details of "+camera.name);


  };

  // Fetch cameras from the API
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get(CAMS_API_URL);
        setCameras(response.data);
        console.log('Cameras:', response.data);
      } catch (error) {
        console.error('Error fetching cameras:', error);
      }
    };
    fetchCameras();
  }, []);


  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-700 ">
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
          <thead className="text-base text-gray-700  bg-gray-50 dark:bg-gray-700 dark:text-sky-400">
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
                <th scope="row" className="px-6 py-4 font-medium text-base      text-gray-900 whitespace-nowrap ">
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
                <button type="button" onClick={() =>handleEditCamera(camera)}
                className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-base px-5 py-2.5 text-center">
                  Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );

  
};

export default ManageCamera;
