import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Header from './components/Header';
import StartPage from './components/StartPage';
import PsycheTest from './components/PsycheTest';
import ResultPage from './components/ResultPage';
import ThreeDModel from './components/ThreeDModel';
import TextMotion from './components/TextMotion';
import SplashScreen from './components/SplashScreen';
import { calculateResults, extractParts } from './utils/scoringAlgorithm';
import questions from './utils/questions';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [stage, setStage] = useState('splash');
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [testResults, setTestResults] = useState({});
  const [parts, setParts] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [message, setMessage] = useState('');
  const [interaction, setInteraction] = useState(false);
  const [completedAnswers, setCompletedAnswers] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audioElement = new Audio('/sounds/ding.mp3');
    audioElement.addEventListener('canplaythrough', () => {
      audioRef.current = audioElement;
    });
    audioElement.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
    });
  }, []);

  useEffect(() => {
    const results = calculateResults(answers);
    setTestResults(results);
    setParts(extractParts(results));
  }, [answers]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (stage === 'splash') {
      const timer = setTimeout(() => {
        setStage('start');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleStart = (name) => {
    setUserName(name);
    setStage('test');
  };

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
    
    const newCount = newAnswers.filter(answer => answer !== null).length;
    if (newCount % 5 === 0) {
      const messages = ["Great!", "Good job!", "GOOD!", "Keep going!", "Awesome!"];
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => setMessage(''), 3000);
    }
  
    setInteraction(true);
    setTimeout(() => setInteraction(false), 1000);
  };

  const handleTestComplete = () => {
    if (answers.every(answer => answer !== null)) {
      setStage('result');
    } else {
      alert('모든 질문에 답변해주세요.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleDevMode = () => {
    if (!isDevMode) {
      const randomName = Math.random().toString(36).substring(2, 5).toUpperCase();
      setUserName(randomName);
      const randomAnswers = Array(questions.length).fill(null).map(() => Math.floor(Math.random() * 5) + 1);
      setAnswers(randomAnswers);
      const results = calculateResults(randomAnswers);
      setTestResults(results);
      setParts(extractParts(results));
      setStage('result');
    }
    setIsDevMode(!isDevMode);
  };

  const handleReset = () => {
    setStage('start');
    setUserName('');
    setAnswers(Array(questions.length).fill(null));
    setTestResults({});
    setParts({});
    setMessage('');
    setCompletedAnswers(0);
  };

  const handleAnswerComplete = () => {
    setCompletedAnswers(prev => Math.min(prev + 1, 5));
  };

  return (
    <Router>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200">
        {showSplash && (
          <SplashScreen 
            videoUrl="/images/machinebutcher_logo.mp4" 
            onFinish={() => {
              setShowSplash(false);
              setStage('start');
            }}
          />
        )}
        {!showSplash && (
          <>
            <Header 
              darkMode={darkMode} 
              toggleDarkMode={toggleDarkMode} 
              toggleDevMode={toggleDevMode}
              onReset={handleReset}
            />
            <main className="container mx-auto p-4">
              {stage === 'start' && (
                <StartPage onStart={handleStart} />
              )}
              {stage === 'test' && (
                <div className="flex flex-col md:flex-row md:space-x-8">
                  <div className="md:w-1/2">
                    <PsycheTest 
                      questions={questions} 
                      onAnswerChange={handleAnswerChange}
                      onComplete={handleTestComplete}
                      onAnswerComplete={handleAnswerComplete}
                      audioRef={audioRef}
                    />
                  </div>
                  <div className="md:w-1/2 h-[600px] bg-[#000033] rounded-lg shadow-lg">
                    <Canvas camera={{ position: [0, 0, 2.5] }}>
                      <color attach="background" args={['#000033']} />
                      <ambientLight intensity={0.2} />
                      <pointLight position={[10, 10, 10]} intensity={0.8} />
                      <ThreeDModel 
                        testResults={testResults} 
                        interaction={interaction}
                        completedAnswers={completedAnswers}
                      />
                      {message && <TextMotion message={message} />}
                      <OrbitControls 
                        enableZoom={false} 
                        enablePan={false}
                        minPolarAngle={Math.PI / 2 - 0.5}
                        maxPolarAngle={Math.PI / 2 + 0.5}
                        minAzimuthAngle={-Math.PI / 4}
                        maxAzimuthAngle={Math.PI / 4}
                      />
                    </Canvas>
                  </div>
                </div>
              )}
              {stage === 'result' && (
                <ResultPage 
                  testResults={testResults} 
                  parts={parts}
                  userName={userName}
                  onRestart={handleReset}
                />
              )}
            </main>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;