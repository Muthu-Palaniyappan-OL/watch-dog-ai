import Slider from "react-slick";



const HowItWorksSection = () => {
    // Slider settings for the image gallery
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
    };
  
    return (
      <div id="HowItWorks" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-sky-400">
              How It Works
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Discover the Magic Behind WatchDog AI
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Explore the steps that enable our AI technology to deliver seamless and accurate analysis of CCTV footage.
            </p>
          </div>
  
          {/* Swipeable Image Gallery */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Slider {...settings}>
              <div>
                <img
                  src="./multicam.png"
                  alt="Step 1"
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
                <p className="mt-4 text-center text-gray-700">Step 1: Footage Capturing</p>
              </div>
              <div>
                <img
                  src="./managecam.png"
                  alt="Step 2"
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
                <p className="mt-4 text-center text-gray-700">Step 2: Manage multiple cameras</p>
              </div>
              
            </Slider>
          </div>
        </div>
      </div>
    );
  };
  
export default HowItWorksSection;