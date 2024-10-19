import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CAMS_API_URL } from '../../constants';


import { ChevronDownIcon} from '@heroicons/react/24/outline'

// Define the Camera interface
interface Camera {
  name: string;
  url: string;
  live: boolean;
  email: string;
  monitoringStatus: boolean;
}

const WatchDogChat: React.FC = () => {
  const [chatHistory, setChatHistory] = useState({
    AIMLAPI: [],
    LocalEdge: []
  });
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCam, setSelectedCam] = useState<string>(''); // State for selected camera
  const [activeChat, setActiveChat] = useState<'AIMLAPI' | 'LocalEdge'>('AIMLAPI'); // Toggle between chats
  const [chatInput, setChatInput] = useState<string>(''); // Chat input state
  const [chatResponse, setChatResponse] = useState<string>(''); // Response from AI/Local Edge
  const [dropdownOpen, setDropdownOpen] = useState(false);

  
  // Fetch cameras from the API on component mount
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get(CAMS_API_URL);
        setCameras(response.data); // Assuming data is an array of cameras
      } catch (error) {
        console.error('Error fetching cameras:', error);
      }
    };
    fetchCameras();
  }, []);

  // Handle camera selection
  const handleCameraSelection = (cameraName: string) => {
    setSelectedCam(cameraName);
    setDropdownOpen(false); // Close the dropdown after selection
  };


  // Handle chat input
  const handleChatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  // Simulate sending a chat request
  const sendChatRequest = async () => {
    if (!selectedCam) {
      alert('Please select a camera first');
      return;
    }

    const endpoint =
      activeChat === 'AIMLAPI' ? 'AIML_API_ENDPOINT' : 'LOCAL_EDGE_ENDPOINT';

    try {
      const response = await axios.post(endpoint, {
        camera: selectedCam,
        message: chatInput,
      });
      setChatResponse(response.data.response); // Assuming the response has a 'response' field
    } catch (error) {
      console.error('Error sending chat request:', error);
    }
  };

  const sendChatRequestNew = () => {
    // Logic to send chat request
    // Update chat history accordingly
    const newResponse = 'Your response here'; // Replace with actual response
    setChatResponse(newResponse);
    setChatHistory((prev) => ({
      ...prev,
      [activeChat]: [...prev[activeChat], { input: chatInput, response: newResponse }]
    }));
    setChatInput('');
  };

  return (
    <div className="">
      
      
      <div className="text-sm font-medium text-center text-gray-500 border-b-2 border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="w-1/2">
            <button
              className={`flex items-center justify-center w-full h-12 border-b-2 rounded-t-lg ${
                activeChat === 'AIMLAPI'
                  ? 'text-sky-500 border-sky-500 font-bold'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveChat('AIMLAPI')}
            >
              <img src="\AI_ML_API_Logo.svg" alt="AI / ML API" className="h-6 mr-2" />
              Powered Chat
            </button>
          </li>
          <li className="w-1/2">
            <button
              className={`flex items-center justify-center w-full h-12 border-b-2 rounded-t-lg text-lg ${
                activeChat === 'LocalEdge'
                  ? 'text-sky-500 border-sky-500 font-bold'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveChat('LocalEdge')}
            >
              <span>Local Edge Chat</span>
            </button>
          </li>
        </ul>
      </div>



      



      

      
      {/* Camera Selection Dropdown */}
      <div className="mb-4 mt-5 flex justify-center">
        <div className="relative inline-block text-left">
          <button
            id="dropdownHoverButton"
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className="text-white bg-sky-500 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
            type="button"
          >
            {selectedCam ? selectedCam : "Select Camera"}
            <ChevronDownIcon className="h-4 w-4 ml-2" aria-hidden="true" />
            
          </button>

          {dropdownOpen && (
            <div className="z-10 absolute right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700">
              <ul className="py-2 text-sm text-gray-400 dark:text-gray-200" aria-labelledby="dropdownHoverButton">
                
                {cameras.map((camera, index) => (
                  <li key={index}>
                    <a
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => handleCameraSelection(camera.name)}
                    >
                      {camera.name} {camera.live ? '(Live)' : '(Offline)'}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Chat Box */}
      {selectedCam && (
        <div className="mt-4">
          <label htmlFor="chatInput" className="block text-sm font-medium text-gray-700">
            Type your message:
          </label>
          <input
            type="text"
            id="chatInput"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            value={chatInput}
            onChange={handleChatInput}
          />
          <button
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={sendChatRequest}
          >
            Send
          </button>
        </div>
      )}

      {/* Chat Response */}
      {chatResponse && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-md">
          <h3 className="font-semibold">Response:</h3>
          <p>{chatResponse}</p>
        </div>
      )}
    </div>


  );
};

export default WatchDogChat;
