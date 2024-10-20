import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import Heroicons for the close icon
import { useNavigate } from 'react-router-dom';
import {FaExclamationTriangle} from 'react-icons/fa';
import { useToast } from '../Toast/ToastContext';


const SignUpModal = ({ onClose }: { onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate()

  const { addToast} = useToast();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous error message
    setSuccess(''); // Clear previous success message

    // Static validation for username and password
    if (username === 'admin' && password === 'Pass@1234') {
      setSuccess('Successful Sign In ! Redirecting to dashboard');
      
      // Close the modal after 3 seconds
      setTimeout(() => {
        setError(''); // Clear the message
        onClose(); // Close the modal
        navigate('/dashboard');
      }, 2000);
      // Here, you can handle successful sign-up logic (e.g., API call, close modal, etc.)
    } else {

      setError('Invalid username or password. Please try again.');
      addToast('Invalid username or password. Please try again.', <FaExclamationTriangle />);

    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 opacity-100 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button with icon, aligned to the right */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        <h2 className="text-2xl font-semibold text-center mb-4">Sign In</h2>

        {/* Centering the form */}
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <label className="mb-2 font-medium text-left w-full">
            Username:
            <input
              type="text"
              name="username"
              required
              className="m-1 p-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="mb-4 font-medium text-left w-full">
            Password:
            <input
              type="password"
              name="password"
              required
              className="m-1 p-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 w-full"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;