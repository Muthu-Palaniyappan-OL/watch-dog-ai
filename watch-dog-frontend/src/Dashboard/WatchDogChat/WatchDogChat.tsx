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
  const [activeChat, setActiveChat] = useState<'AIMLAPI' | 'LocalEdge'>('AIMLAPI'); // Toggle between chats
  const [chatInput, setChatInput] = useState<string>(''); // Chat input state
  const [chatResponse, setChatResponse] = useState<string>(''); // Response from AI/Local Edge
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Independent camera states for each chat mode
  const [selectedCamAIMLAPI, setSelectedCamAIMLAPI] = useState('');
  const [selectedCamLocalEdge, setSelectedCamLocalEdge] = useState('')
  
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
  const handleCameraSelection = (name) => {
    if (activeChat === 'AIMLAPI') {
      setSelectedCamAIMLAPI(name);
    } else {
      setSelectedCamLocalEdge(name);
    }
    setDropdownOpen(false);
  };


  // Handle chat input
  const handleChatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  
  const sendChatRequest = () => {
    const newResponse = 'Your response here'; // Replace with actual response
    setChatHistory((prev) => ({
      ...prev,
      [activeChat]: [...prev[activeChat], { input: chatInput, response: newResponse }]
    }));
    setChatInput('');
  };


  const ChatBox = ({ chatHistory, selectedCam, setDropdownOpen, handleCameraSelection, chatInput, handleChatInput, sendChatRequest, dropdownOpen, cameras }) => {
    return (
      <div className="mt-4">
        {/* Camera Selection Dropdown */}
        <div className={`mb-4 mt-5 flex ${activeChat === 'AIMLAPI' ? 'justify-start' : 'justify-end'}`}>
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
  
        {selectedCam && (
          <>
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
          </>
        )}
  
        {/* Display Chat History */}
        {chatHistory.map((chat, index) => (
          <div key={index} className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-md">
            <h3 className="font-semibold">You:</h3>
            <p>{chat.input}</p>
            <h3 className="font-semibold">Response:</h3>
            <p>{chat.response}</p>
          </div>
        ))}
      </div>
    );
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
              <img src="\AI_ML_API_Logo.svg" alt="AI / ML API" className={` mr-3 
              ${activeChat === 'AIMLAPI' ? 'h-7 ' : ' h-6' }`} />
              Powered Chat
            </button>
          </li>
          <li className="w-1/2">
            <button
              className={`flex items-center justify-center w-full h-12 border-b-2 rounded-t-lg  ${
                activeChat === 'LocalEdge'
                  ? 'text-sky-500 border-sky-500 font-bold text-xl'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-lg'
              }`}
              onClick={() => setActiveChat('LocalEdge')}
            >
              <span>Local Edge Chat</span>
            </button>
          </li>
        </ul>
      </div>


      
      <div className={`transition-all duration-500 ease-in-out ${activeChat === 'AIMLAPI' ? 'block' : 'hidden'}`}>
        <ChatBox 
          chatHistory={chatHistory['AIMLAPI']} 
          selectedCam={selectedCamAIMLAPI}
          setDropdownOpen={setDropdownOpen}
          handleCameraSelection={handleCameraSelection}
          chatInput={chatInput} 
          handleChatInput={handleChatInput} 
          sendChatRequest={sendChatRequest} 
          dropdownOpen={dropdownOpen} 
          cameras={cameras}
        />
      </div>

      <div className={`transition-all duration-500 ease-in-out ${activeChat === 'LocalEdge' ? 'block' : 'hidden'}`}>
      <ChatBox 
          chatHistory={chatHistory['LocalEdge']} 
          selectedCam={selectedCamLocalEdge}
          setDropdownOpen={setDropdownOpen}
          handleCameraSelection={handleCameraSelection}
          chatInput={chatInput} 
          handleChatInput={handleChatInput} 
          sendChatRequest={sendChatRequest} 
          dropdownOpen={dropdownOpen} 
          cameras={cameras}
        />
      </div>




    </div>


  );


};






export default WatchDogChat;
