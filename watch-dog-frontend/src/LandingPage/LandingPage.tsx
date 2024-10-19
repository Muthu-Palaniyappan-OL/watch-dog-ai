import { useState } from 'react';
import SignUpModal from './SignUpModal';
import {LockClosedIcon, VideoCameraIcon, BellAlertIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion';
const features = [
  {
    name: 'Natural Language Queries',
    description:
    'Simply ask WatchDog AI to find specific moments using everyday language, and get the exact timestamps or events you need without the hassle of scrubbing through footage.'  
    ,icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Keyframe Detection',
    description:
    'Automatically captures important moments in your footage, saving you time by highlighting the key events that matter most. '  
    ,icon: LockClosedIcon,
  },
  
  {
    name: 'Automatic Alerts',
    description:
    'Get instant notifications when suspicious activity is detected, ensuring you can act quickly to protect what matters. '  
    ,icon: BellAlertIcon,
  },
  {
    name: 'Transcription Capabilities',
    description:
    'Turn your video streams into detailed, searchable transcripts, making it easy to review events and conversations at a glance.'  
    ,icon: DocumentTextIcon,
  },
  {
    name: 'Continuous Monitoring',
    description: 'WatchDog AI keeps an eye on your camera streams 24/7, providing seamless, uninterrupted surveillance so you’re always protected.',  
    icon: VideoCameraIcon,
  },
]


const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    
    <div>
      <div className="bg-white">
        <header className="absolute inset-x-0 top-0 z-50 ">
          <nav className="flex items-center justify-between p-6 lg:px-8 bg-gray-800" aria-label="Global">
            <div className="flex lg:flex-1"> 
            
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">WatchDog AI</span>
                <img className="h-10 w-auto" src="./watchdog.svg" alt=""/>
              </a>
            </div>
           
            <div className="flex lg:hidden">
              <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-stone-300">
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
            <div className="hidden lg:flex lg:gap-x-12">
              <a href="#" className="text-lg font-semibold leading-6 text-stone-300 hover:text-sky-300">Product</a>
              <a href="#Features" className="text-lg font-semibold leading-6 text-stone-300  hover:text-sky-300">Features</a>
              <a href="#" className="text-lg font-semibold leading-6 text-stone-300  hover:text-sky-300">Marketplace</a>
              <a href="#" className="text-lg font-semibold leading-6 text-stone-300  hover:text-sky-300">Company</a>
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <a href="#" className="text-lg font-semibold leading-6 text-stone-300">Sign Up <span aria-hidden="true">&rarr;</span></a>
            </div>
          </nav>
          <div className="lg:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 z-50"></div>
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">Your Company</span>
                  <img className="h-20 w-auto" src="./watchdog.svg" alt=""/>
                </a>
                <button type="button" className="-m-2.5 rounded-md p-2.5 text-gray-700">
                  <span className="sr-only">Close menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    <a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Product</a>
                    <a href="#Features" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Features</a>
                    <a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Marketplace</a>
                    <a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Company</a>
                  </div>
                  <div className="py-6">
                    <a href="#" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Log in</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        {isModalOpen && <SignUpModal onClose={closeModal} />}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
            }}
          ></div>
          </div>
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
            <motion.img
              className="absolute left-[408px] top-[140px]"
              drag
              src='/doggo.png'
              dragSnapToOrigin
              dragTransition={{bounceStiffness: 40, bounceDamping: 7 }}
              animate={["initial"]}
              variants={{
                initial: {
                  y: [-10, 10],
                  x:[-5,5],
                  rotate: 5,
                  transition: {
                    delay:1,
                    duration: 2,
                    repeat: Infinity,
                    // repeatDelay: 0.2,
                    repeatType: "reverse"
                  }
                }
              }}
            >
            </motion.img>
          
              <h1 className="text-balance text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Revolutionize Your Security with WatchDog AI</h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">The Future of Surveillance: AI That Understands Your World</p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
              <div>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault(); // Prevent the default anchor behavior
          openModal();
        }}
        className="rounded-md bg-sky-400 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        Get started
      </a>

      
    </div> <a href="#" className="text-sm font-semibold leading-6 text-gray-900">Learn more <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
              }}
            ></div> 
          </div>
        </div>

      </div>

      <div id="Features" className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-sky-400">Just ask to Find</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Powerful Features Built for Smarter Surveillance
          </p>
          <p className="mt-6 text-lg leading-8 text-stone-300">
              From continuous monitoring to instant alerts, discover how WatchDog AI enhances security with cutting-edge technology designed to save you time and keep you in control.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400">
                    <feature.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-stone-200">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>


    </div>
  );
};

export default LandingPage;
