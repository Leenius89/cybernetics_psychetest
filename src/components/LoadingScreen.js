import React from 'react';

const LoadingScreen = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
      <video
        className="w-64 h-64 mb-8"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/images/machinebutcher_logo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p className="text-xl text-gray-800 font-semibold">{message}</p>
    </div>
  );
};

export default LoadingScreen;