import { useState } from "react";

const Slides: { text: string; video: string }[] = [
  {
    text: "Teach a drone how to avoid obstacles using Reinforcement Learning",
    video: "/introModal/fast_small_trim.mp4",
  },
  {
    text: "The drone can move in 6 directions. It is equipped with proximity sensors in each direction.",
    video: "/introModal/crash_small_trim.mp4",
  },
  {
    text: "The drone is rewarded for moving in the direction of the goal, and penalized for moving into obstacles.",
    video: "/introModal/reward_small_trim.mp4",
  },
  {
    text: `On the next screen you will see the drone with some pretrained weights. Hit the green button to start training from scratch. How fast can you get the drone to learn to avoid obstacles?`,
    video: "/introModal/running_small.mp4",
  },
];

interface IntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntroModal({ isOpen, onClose }: IntroModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoLoading, setVideoLoading] = useState(true);

  if (!isOpen) return null;

  const nextSlide = () => {
    if (currentSlide < Slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setVideoLoading(true);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setVideoLoading(true);
    }
  };

  const handleClose = () => {
    setCurrentSlide(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome to RL Drone Training
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-center mb-4 relative">
              {Slides[currentSlide].video ? (
                <>
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded max-w-md h-48 mx-auto">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <video
                    src={Slides[currentSlide].video}
                    autoPlay
                    loop
                    muted
                    className={`w-full max-w-md h-48 object-contain rounded ${videoLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                    onLoadedData={() => setVideoLoading(false)}
                    onLoadStart={() => setVideoLoading(true)}
                  />
                </>
              ) : (
                <div className="w-full max-w-md h-48 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-gray-500 text-lg">Ready to start!</div>
                </div>
              )}
            </div>

            <p className="text-lg text-gray-700 text-center leading-relaxed">
              {Slides[currentSlide].text}
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {Slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentSlide ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentSlide === Slides.length - 1 ? (
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              >
                Ok!
              </button>
            ) : (
              <button
                onClick={nextSlide}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
