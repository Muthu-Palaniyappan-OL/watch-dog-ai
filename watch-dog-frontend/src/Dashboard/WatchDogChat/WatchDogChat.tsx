import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CAMS_API_URL , CHAT_API_URL,LOCAL_CHAT_API_URL} from '../../constants';
import { PaperAirplaneIcon , InformationCircleIcon, ChatBubbleBottomCenterIcon, ArrowPathIcon, ArrowDownTrayIcon} from '@heroicons/react/24/outline';

import { useToast } from "../../Toast/ToastContext";


import { ChevronDownIcon} from '@heroicons/react/24/outline'
import { a } from 'framer-motion/client';
import { FaExclamationTriangle } from 'react-icons/fa';

// Define the Camera interface
interface Camera {
  id: number;
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
  const myRef = useRef<HTMLElement | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activeChat, setActiveChat] = useState<'AIMLAPI' | 'LocalEdge'>('AIMLAPI'); // Toggle between chats
  const [chatInput, setChatInput] = useState<string>(''); // Chat input state
  const [chatResponse, setChatResponse] = useState<string>(''); // Response from AI/Local Edge
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [selectedCamAIMLAPI, setSelectedCamAIMLAPI] = useState<Camera>(null);
  const [selectedCamLocalEdge, setSelectedCamLocalEdge] = useState<Camera>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement | null>(null); 
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  
  const { addToast } = useToast();

  const chatEndRef = useRef(null); // Create a reference for the last chat element

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the bottom smoothly
    }
  };

  // Use useEffect to trigger the scroll whenever the chat history updates
  useEffect(() => {
    scrollToBottom(); // Scroll down when chatHistory updates
  }, [chatHistory]);


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
    scrollToBottom();
    fetchCameras();
  }, []);

  // Handle camera selection
  const handleCameraSelection = async (camera) => {
    if (activeChat === 'AIMLAPI') {
      if(selectedCamAIMLAPI!=null &&  selectedCamAIMLAPI.id != camera.id){
        setChatHistory((prev) => ({
          ...prev,
          'AIMLAPI': []
        }))
      };

      setSelectedCamAIMLAPI(camera);
      

    } 
    else {
      if (selectedCamLocalEdge!=null && selectedCamLocalEdge.id != camera.id){
        setChatHistory((prev) => ({
          ...prev,
          'LocalEdge': []
        }))
       };
      setSelectedCamLocalEdge(camera);
    }
     
    var chatUrl= activeChat === 'AIMLAPI' ? CHAT_API_URL : LOCAL_CHAT_API_URL;
    
    try {
      const response = await fetch(chatUrl+`${camera.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        addToast('Failed to fetch chat history', <FaExclamationTriangle />);
        throw new Error('Failed to fetch chat history');
      }
  
      const data = await response.json();
  
      
      setChatHistory((prev) => ({
        ...prev,
        [activeChat]: data.map((chat) => ({
          input: chat.user_query,
          response: chat.response,
          sentTime: new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          receivedTime: new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          frames: chat.frames,
          camera: camera, // Store the selected camera
        })),
      }));

      scrollToBottom();
  
      // Scroll to the bottom of the chat history
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
  
    } catch (error) {
      addToast('Error fetching chat history', <FaExclamationTriangle />);
      console.error('Error fetching chat history:', error);
      // Optionally, trigger a toast notification to display the error
    }
  

    setDropdownOpen(false);
  };


  // Handle chat input
  const handleChatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update state if necessary to avoid excessive renders
    setChatInput(e.target.value);
  };
  

  
  const sendChatRequest = async () => {
    if (inputRef.current) {
      const inputMessage = inputRef.current.value; 
      if (inputMessage.trim() === '') {
        return;
      }

      const selectedCam = activeChat === 'AIMLAPI' ? selectedCamAIMLAPI : selectedCamLocalEdge; 
      if (!selectedCam) {
        alert("Please select a camera first.");
        return;
      }
      
      const sentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      
      setChatHistory((prev) => ({
        ...prev,
        [activeChat]: [
          ...prev[activeChat],
          { input: inputMessage, response: '', sentTime: sentTime, loading: true, camera: selectedCam }
        ]
      }));

      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
  
      // Clear the input field
      inputRef.current.value = '';
      setIsLoading(true); 
  
      try {
        const chatUrl = activeChat === 'AIMLAPI' ? CHAT_API_URL : LOCAL_CHAT_API_URL;
        // Replace the timeout with a real API call
        const response = await fetch(chatUrl+`${selectedCam.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_query: inputMessage }), // Pass user query to backend
        });
   
        if (!response.ok) {
          addToast('Failed to get response from server', <FaExclamationTriangle />);
          throw new Error('Failed to get response from server');
        }
   
        const data = await response.json(); // Parse the JSON response
        const receivedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   
        // Update the last chat entry to include the response and mark loading as false
        setChatHistory((prev) => {
          const updatedChats = [...prev[activeChat]];
          const lastChatIndex = updatedChats.length - 1;
          updatedChats[lastChatIndex] = {
            ...updatedChats[lastChatIndex],
            response: data.response,  // Use backend response
            camera: selectedCam,
            loading: false,
            receivedTime: receivedTime,
            images: data.frames || [], // Assuming backend returns 'frames'
            imageCount: (data.frames || []).length  
          };
   
          if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
          }
   
          return { ...prev, [activeChat]: updatedChats };
        });
   
      } 
      catch (error) {
        console.error('Error fetching chat response:', error);
        addToast('Error fetching chat response. Try again Later!', <FaExclamationTriangle />);
        // Handle error (you can add a toast notification here for errors)

        setChatHistory((prev) => {
          const updatedChats = [...prev[activeChat]];
          const lastChatIndex = updatedChats.length - 1;
          updatedChats[lastChatIndex] = {
            ...updatedChats[lastChatIndex],
            response: "Error fetching chat response. Try again Later!",  
            loading: false, 
          };
   
          if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
          }
          myRef.current?.scrollIntoView();
   
          return { ...prev, [activeChat]: updatedChats };
        });

      }
      setIsLoading(false); 
    }
  };
 
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]); // Trigger the scroll whenever chatHistory changes

  const downloadImage = (base64Image, fileName) => {
    const link = document.createElement("a");
  
    link.download = fileName;
  
    link.href = `${base64Image}`;
  
    // Append the link to the body temporarily
    document.body.appendChild(link);
  
    // Programmatically click the link to trigger the download
    link.click();
  
    // Remove the link from the document after downloading
    document.body.removeChild(link);
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
              {selectedCam ? selectedCam.name+" (ID : "+selectedCam.id+" )"  : "Select Camera"}
              <ChevronDownIcon className="h-4 w-4 ml-2" aria-hidden="true" />
            </button>
  
            {dropdownOpen && (
              <div className={`z-10 absolute ${activeChat === 'AIMLAPI' ? 'left-0' : 'right-0'} 
               mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700`}>
                <ul className="py-2 text-sm text-gray-400 dark:text-gray-200" aria-labelledby="dropdownHoverButton">
                  {cameras.map((camera : Camera, index : number) => (
                    <li key={index}>
                      <a
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={() => handleCameraSelection(camera)}
                      >
                        {camera.name} {camera.live ? '(Live)' : '(Offline)'} (ID : {camera.id})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
  
        

        <div className="flex flex-col h-full" id="chat-container">
          
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
                      <span className="text-sm font-normal text-gray-500">{chat.sentTime}</span>
                    </div>

                    <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                      <p className="text-sm font-normal text-gray-900 dark:text-white">{chat.input}</p>
                      
                      {chat.camera && (
                        <p className="text-xs text-right text-sky-500"><b>Camera:</b> {chat.camera.id}</p>
                      )}
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
                      <span className="text-sm font-normal text-gray-500">{chat.loading ? '...' : chat.receivedTime}</span>
                    </div>
                    <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-sky-500 rounded-e-xl rounded-es-xl">
                      <p className="text-sm font-semibold text-white">
                        {chat.loading ? (
                          <span>Loading <ArrowPathIcon className='inline animate-spin h-5 w-5'></ArrowPathIcon></span>
                        ) : chat.response}
                      </p>
                      
                      {!chat.loading && chat.camera.id && (
                        <p className="text-xs text-left text-gray-500">
                          <b>Camera:</b> {chat.camera.id}
                        </p>
                      )}

                      {/* Display images if available */}
                      {!chat.loading && chat.images && chat.images.length > 0 && (
                        <div className="grid gap-4 grid-cols-2 my-2.5">
                          {chat.images.slice(0, 3).map((image, index) => (
                            <div key={index} className="group relative">
                              <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                <button
                                  onClick={() => downloadImage(image, selectedCam.name+`-image-${index + 1}.png`)} // Call the download function
                                  className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50">
                                  <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                              </div>
                              <img src={`${image}`} alt={`Image ${index + 1}`} className="rounded-lg h-full w-full" />
                            </div>
                          ))}

                          {chat.images.length > 3 && (
                            <div className="group relative">
                              <button className="absolute w-full h-full bg-gray-900/90 hover:bg-gray-900/50 transition-all duration-300 rounded-lg flex items-center justify-center">
                                <span className="text-xl font-medium text-white">+{chat.images.length - 3}</span>
                              </button>
                              <img src={`data:image/png;base64,${chat.images[3]}`} className="rounded-lg" alt="Extra images" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>


              </div>
            ))}
<div ref={chatEndRef}></div>

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
