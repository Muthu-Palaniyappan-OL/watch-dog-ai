import React, { useState } from 'react';
interface Camera {
    name: string;
    url: string;
    live: boolean;
    email: string;
    monitoringStatus: boolean;
  }
interface EditCameraProps {
  camera: Camera;
  onSave: (updatedCamera: Camera) => void;
  onCancel: () => void;
}

const EditCamera: React.FC<EditCameraProps> = ({ camera, onSave, onCancel }) => {
  const [name, setName] = useState(camera.name);
  const [url, setUrl] = useState(camera.url);
  const [email, setEmail] = useState(camera.email);
  const [monitoringStatus, setMonitoringStatus] = useState(camera.monitoringStatus);

  const handleSave = () => {
    const updatedCamera = {
      ...camera,
      name,
      url,
      email,
      monitoringStatus,
    };
    onSave(updatedCamera);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">Edit Camera Details</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="cameraName">
          Camera Name
        </label>
        <input
          type="text"
          id="cameraName"
          className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-300"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="feedUrl">
          Feed URL
        </label>
        <input
          type="text"
          id="feedUrl"
          className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-300"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="alertEmail">
          Alert E-Mail
        </label>
        <input
          type="email"
          id="alertEmail"
          className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">Monitoring Status</label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="monitoringStatus"
              value="on"
              checked={monitoringStatus === true}
              onChange={() => setMonitoringStatus(true)}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">On</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="monitoringStatus"
              value="off"
              checked={monitoringStatus === false}
              onChange={() => setMonitoringStatus(false)}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Off</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditCamera;
