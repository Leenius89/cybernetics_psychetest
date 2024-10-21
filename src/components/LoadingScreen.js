import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ message = "로딩 중..." }) => {
  const [displayMessage, setDisplayMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    let typingInterval;
    let pauseTimeout;

    const typeMessage = () => {
      if (index < message.length) {
        setDisplayMessage((prev) => prev + message[index]);
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        pauseTimeout = setTimeout(() => {
          setIsTyping(true);
          setDisplayMessage('');
          index = 0;
          typingInterval = setInterval(typeMessage, 100);
        }, 1000);
      }
    };

    typingInterval = setInterval(typeMessage, 100);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(pauseTimeout);
    };
  }, [message]);

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
      <p className="text-xl text-gray-800 font-semibold h-8">
        {displayMessage}
        {isTyping && <span className="animate-blink">|</span>}
      </p>
    </div>
  );
};

export default LoadingScreen;