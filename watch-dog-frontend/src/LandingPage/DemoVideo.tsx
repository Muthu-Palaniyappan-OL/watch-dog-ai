import { motion } from "framer-motion";
import YouTube from "react-youtube";

const videoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const VideoSection = () => {
  // YouTube video options
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,  // Auto-play the video when loaded
    },
  };

  const onReady = (event) => {
    // Access to player in all event handlers via event.target
    event.target.pauseVideo();
  };

  return (
    <div id="Demo" className="bg-gray-900 py-24 sm:py-32">
             <motion.img
      className="absolute bottom-1/100 right-1/100 transform -translate-x-1/2 "
      drag
      src="/cctvglossy.png"
      dragElastic={0} // No overshoot, snaps directly back
      dragTransition={{ bounceStiffness: 40, bounceDamping: 7 }} 
      dragConstraints={{ left: -300, right: 50, top: -100, bottom: 100 }}           
      animate={["initial"]}
      variants={{
        initial: {
          y: [0, 10],
          x: [90, 80],
          rotate: 5,
          transition: {
            delay: 1,
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          },
        },
      }}
    />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-sky-400">
            Watch in Action
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Experience WatchDog AI in Action
       
          </p>
          <p className="mt-6 text-lg leading-8 text-stone-300">
            Discover how our cutting-edge AI technology enhances surveillance with real-time analysis. Watch the demo below.
          </p>
     
        </div>
        
        {/* Centered YouTube Video */}
        <motion.div
          className="flex justify-center items-center mt-16 sm:mt-20 lg:mt-24"
          initial="hidden"
          animate="visible"
          variants={videoVariants}
        >
           
          <div className="w-full flex justify-center">
            <YouTube videoId="o2iNCQDjV7w" opts={opts} onReady={onReady} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoSection;
