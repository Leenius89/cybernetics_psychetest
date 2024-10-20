import React, { useEffect, useRef, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ videoUrl, onFinish }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    const handleEnded = () => {
      setIsEnded(true);
      setTimeout(() => {
        onFinish();
      }, 1000); // Delay to allow fold-in animation to complete
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${isEnded ? 'fold-in' : ''}`} ref={containerRef}>
      <div className="splash-content">
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          playsInline
          autoPlay
          className="splash-video"
        />
      </div>
    </div>
  );
};

export default SplashScreen;