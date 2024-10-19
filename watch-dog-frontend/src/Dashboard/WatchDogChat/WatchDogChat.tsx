import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CAMS_API_URL } from '../../constants';
import { PaperAirplaneIcon , InformationCircleIcon, ChatBubbleBottomCenterIcon, ArrowPathIcon} from '@heroicons/react/24/outline';


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

  const [selectedCamAIMLAPI, setSelectedCamAIMLAPI] = useState('');
  const [selectedCamLocalEdge, setSelectedCamLocalEdge] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement | null>(null); 
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  

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
    // Only update state if necessary to avoid excessive renders
    setChatInput(e.target.value);
  };
  

  
  const sendChatRequest = () => {
    if (inputRef.current) {
      const inputMessage = inputRef.current.value; // Get value from inputRef
      if (inputMessage.trim() === '') {
        return; // Abort if input is empty or only whitespace
      }
      
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Immediately add the sent message to chat history
      setChatHistory((prev) => ({
        ...prev,
        [activeChat]: [
          ...prev[activeChat],
          { input: inputMessage, response: '', time: currentTime, loading: true } // Mark as loading
        ]
      }));

      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
  
      // Clear the input field
      inputRef.current.value = '';
      setIsLoading(true); 
  
      // Simulate an API call to get a response (replace with actual API call)
      setTimeout(() => {
        const newResponse = 'Your response here'; // Replace with actual response
        // Update the last chat entry to include the response and mark loading as false
        setChatHistory((prev) => {
          const updatedChats = [...prev[activeChat]];
          const lastChatIndex = updatedChats.length - 1; // Get the last chat index
          updatedChats[lastChatIndex] = {
            ...updatedChats[lastChatIndex],
            response: newResponse,
            loading: false 
          };

          if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
          }

          return { ...prev, [activeChat]: updatedChats };
        });
      }, 5000); // Simulate a 10-second delay for response

      setIsLoading(false); 
    }
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
              <div className={`z-10 absolute ${activeChat === 'AIMLAPI' ? 'left-0' : 'right-0'} 
               mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700`}>
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
  
        

        <div className="flex flex-col h-full ">
          
          <div ref={chatHistoryRef} className="flex-1 overflow-y-auto p-4 bg-gray-100 border border-gray-300 rounded-md max-h-96 min-h-96">
            {!selectedCam && (
              <div className="flex items-center justify-center h-full mt-[10%]">
                <InformationCircleIcon className="h-10 w-10 text-gray-500 mx-2" />
                <p className="text-2xl font-semibold text-gray-500">Select a Camera, to start a query!</p>
              </div>
            )}
            {selectedCam && chatHistory.length === 0 && (
              <div className="flex items-center justify-center h-full mt-[10%]">
                <ChatBubbleBottomCenterIcon className="h-10 w-10 text-gray-500 mx-2" />
                <p className="text-2xl font-semibold text-gray-500">Start a conversation!</p>
              </div>
            )}

            {chatHistory.map((chat, index) => (
              <div key={index} className="mt-2">

                {/* You - Sender Bubble */}
                <div className="flex items-start gap-2.5 justify-end mt-2">
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">You</span>
                      <span className="text-sm font-normal text-gray-500">{chat.time}</span>
                    </div>
                    <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                      <p className="text-sm font-normal text-gray-900 dark:text-white">{chat.input}</p>
                    </div>
                    <span className="text-sm font-normal text-gray-500">Delivered</span>
                  </div>
                  <img className="w-8 h-8 rounded-full" src="/user.png" alt="Your image" />
                </div>

                {/* WatchDogAI - Response Bubble */}
                <div className="flex items-start gap-2.5 mt-2">
                  <img className="w-8 h-8 rounded-full" src="/watchdog.png" alt="WatchDogAI image" />
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-sm font-bold text-gray-900">WatchDogAI</span>
                      <span className="text-sm font-normal text-gray-500">{chat.loading ? '...' : chat.time}</span>
                    </div>
                    <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-sky-500 rounded-e-xl rounded-es-xl">
                      <p className="text-sm font-semibold text-white">{chat.loading ? (<span>Loading <ArrowPathIcon className='inline animate-spin h-5 w-5'></ArrowPathIcon></span>) : chat.response}</p>
                    </div>
                  </div>
                </div>

              </div>
            ))}





          </div>


          {/* Input Area */}
          {selectedCam && (
            <div className="flex items-center space-x-2 my-2">
              <textarea
                id="chatInput"
                ref={inputRef} // Use ref to access input value
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 resize-none max-h-[100px] overflow-auto"
                placeholder="Ask your query here..."
                rows={3} // Start with one visible row
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { // Check for Enter without Shift
                    e.preventDefault(); // Prevent new line
                    sendChatRequest(); // Trigger send when Enter is pressed
                  }
                }}
                disabled={isLoading}
                maxLength={200}
              />

            
              <button
                className="px-4 py-5 text-lg font-bold bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                onClick={sendChatRequest}
              >
                Send
                <PaperAirplaneIcon className="h-5 w-5 ml-2" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>


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
