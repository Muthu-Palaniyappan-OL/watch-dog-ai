import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import { CAMS_API_URL } from '../../constants';


interface Camera {
  live: boolean;
  name: string;
  url: string;
  monitoringStatus: boolean;
}

const CCTVView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [layout, setLayout] = useState(4); // 1, 4, or 9 boxes layout

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

  // YouTube iframe options
  const opts = {
    height: '100%', // Change height to 100%
    width: '100%', // Change width to 100%
    playerVars: {
      autoplay: 1, // Autoplay the video
      controls: 0, // Disable video controls
      showinfo: 0, // Hide video title and uploader
      mute:1,
      iv_load_policy: 3,
      cc_load_policy:0,
      disablekb:1,
      rel:0,
      //disable title and uploader
      
    },
  };

  // Function to render the layout dynamically based on the number of boxes
  const renderCameras = () => {
    return cameras.slice(0, layout).map((camera, index) => (
      <div key={index} className=" h-full flex flex-col bg-indigo-400 relative"> {/* Add h-full and w-full */}
        <h3 className="absolute top-2 left-2 z-10 flex justify-center bg-white text-center px-2">{camera.name} {camera.live ? '🔴 Live' : '⚫ Offline'}</h3>
        <div className="flex-grow ">
          <YouTube className='h-full' videoId={getVideoId(camera.url)} opts={opts} />
        </div>
      </div>
    ));
  };

  // Extract YouTube video ID from URL
  const getVideoId = (url: string) => {
    const urlParams = new URL(url).searchParams;
    return urlParams.get('v');
  };

  return (
    <div  className="relative w-full h-screen bg-black pt-0">
      

      <div  className="absolute top-5 right-4 z-20 flex justify-center rounded-md shadow-sm"
     role="group">
        <button
          type="button" onClick={() => setLayout(1)}
          className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-s-lg focus:z-10 focus:ring-2 ${
            layout === 1
              ? 'bg-blue-700 text-white dark:bg-blue-500'
              : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
          }`}
        >
          Single View
        </button>
        <button
          type="button" onClick={() => setLayout(4)}
          className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-200 focus:z-10 focus:ring-2 ${
            layout === 4
              ? 'bg-blue-700 text-white dark:bg-blue-500'
              : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
          }`}
        >
          4-Cam View
        </button>
        <button
          type="button" onClick={() => setLayout(9)}
          className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-e-lg focus:z-10 focus:ring-2 ${
            layout === 9
              ? 'bg-blue-700 text-white dark:bg-blue-500'
              : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
          }`}
        >
          9-Cam View
        </button>
      </div>
      <div className='grid grid-cols-1 grid-cols-2 grid-cols-3 divide-none'/>
      
      <div className={`grid grid-cols-${Math.sqrt(layout)} h-5/6  gap-1 bg-gray-300`}
        style={{ gridTemplateRows: `repeat(${Math.ceil(layout / Math.sqrt(layout))}, 1fr)` }} // Dynamically adjust row heights
      >

        {renderCameras()}
      </div>
    </div>
  );
};

export default CCTVView;
