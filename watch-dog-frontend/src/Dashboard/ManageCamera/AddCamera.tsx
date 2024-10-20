import React, { useState } from 'react';
import { FaPlusCircle } from 'react-icons/fa';

interface Camera {
  id: number;
  name: string;
  url: string;
  live: boolean;
  email: string;
  monitoringStatus: boolean;
}

interface AddCameraProps {
  onSave: (newCamera: Camera) => void;
  onCancel: () => void;
}

const AddCamera: React.FC<AddCameraProps> = ({ onSave, onCancel }) => {
  const [newCamera, setNewCamera] = useState<Camera>({
    id: 0,
    name: '',
    url: '',
    live: false,
    email: '',
    monitoringStatus: false,
  });
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewCamera({
      ...newCamera,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newCamera); // Call the onSave function to add the camera
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Add New Camera</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Camera Name
          </label>
          <input
            type="text"
            name="name"
            value={newCamera.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Feed URL
          </label>
          <input
            type="text"
            name="url"
            value={newCamera.url}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Alert E-Mail
          </label>
          <input
            type="email"
            name="email"
            value={newCamera.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Live Status
          </label>
          <input
            type="checkbox"
            name="live"
            checked={newCamera.live}
            onChange={handleChange}
          />
          <span className="ml-2">Live</span>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Monitoring Status
          </label>
          <input
            type="checkbox"
            name="monitoringStatus"
            checked={newCamera.monitoringStatus}
            onChange={handleChange}
          />
          <span className="ml-2">Monitoring On</span>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Camera <FaPlusCircle className="inline ml-2" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCamera;
