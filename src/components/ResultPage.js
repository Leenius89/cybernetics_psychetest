import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import ThreeDModel from './ThreeDModel';
import { Radar, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { calculateCategoryScores } from '../utils/abilityCategorization';
import { getDetailedInterpretation } from '../utils/resultInterpretationUtilities';
import { generateAIImage } from '../utils/fluxAIService';
import LoadingScreen from './LoadingScreen';
import { CheckCircle } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ResultPage = ({ testResults, parts, userName, onRestart }) => {
  const [isDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [aiImage, setAiImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState(null);
  const imageRequestedRef = useRef(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("AI 이미지 생성 중...");
  const audioRef = useRef(null);

  const categoryScores = useMemo(() => calculateCategoryScores(testResults), [testResults]);
  const detailedInterpretation = useMemo(() => getDetailedInterpretation(testResults, categoryScores), [testResults, categoryScores]);

  const sortedTestResults = useMemo(() => {
    return Object.entries(testResults)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .reduce((r, [k, v]) => ({ ...r, [k]: v || 0 }), {});
  }, [testResults]);

  const topTwoAbilities = useMemo(() => {
    return Object.entries(parts)
      .flatMap(([key, abilities]) => abilities.map(ability => ({ key, ability })))
      .sort((a, b) => (testResults[b.ability] || 0) - (testResults[a.ability] || 0))
      .slice(0, 2);
  }, [parts, testResults]);

  const chartTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
  const chartLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

  const radarData = useMemo(() => ({
    labels: Object.keys(categoryScores),
    datasets: [{
      label: 'Category Scores',
      data: Object.values(categoryScores),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
    }],
  }), [categoryScores]);

  const barData = useMemo(() => ({
    labels: Object.keys(sortedTestResults),
    datasets: [{
      label: 'Ability Scores',
      data: Object.values(sortedTestResults),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  }), [sortedTestResults]);

  const radarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: chartLineColor },
        grid: { color: chartLineColor },
        pointLabels: { color: chartTextColor, font: { size: 12 } },
        ticks: { display: false },
      },
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
        bodyColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
      }
    },
  }), [isDarkMode, chartLineColor, chartTextColor]);

  const barOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        grid: { color: chartLineColor },
        ticks: { color: chartTextColor }
      },
      y: { 
        grid: { display: false },
        ticks: { color: chartTextColor }
      },
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
        bodyColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
      }
    },
  }), [isDarkMode, chartLineColor, chartTextColor]);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/loadingsound/loadingsound.mp3');
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const playAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

 const generateImage = useCallback(async () => {
    if (imageRequestedRef.current) return;
    imageRequestedRef.current = true;
    setIsGeneratingImage(true);
    setError(null);
    setLoadingMessage("AI 이미지 생성 중...");
    playAudio();
    try {
      const imageUrl = await generateAIImage(testResults, categoryScores);
      setAiImage(imageUrl);
    } catch (error) {
      console.error("Failed to generate image:", error);
      setError(error.message || "이미지 생성에 실패했습니다.");
    } finally {
      setIsGeneratingImage(false);
      stopAudio();
    }
  }, [testResults, categoryScores, playAudio, stopAudio]);
  
  useEffect(() => {
    if (!aiImage && !isGeneratingImage && !error) {
      generateImage();
    }
  }, [aiImage, isGeneratingImage, error, generateImage]);
  
  const handleDownloadParts = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (aiImage) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'ai_generated_parts.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/jpeg');
      };
      img.src = aiImage;
    }
  }, [aiImage]);

  const toggleFullscreen = useCallback((e) => {
    e.stopPropagation();
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleShareTest = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, []);

  useEffect(() => {
    if (!aiImage && !isGeneratingImage && !error) {
      generateImage();
    }
  }, [aiImage, isGeneratingImage, error, generateImage]);

  if (isGeneratingImage) {
    return <LoadingScreen message={loadingMessage} />;
  }

  return (
    <div className="flex flex-col space-y-4 relative">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{userName}님의 테스트 결과</h2>
        
        {/* 768px 미만 화면용 레이아웃 */}
        <div className="md:hidden">
          {/* 발견된 능력 */}
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">발견된 능력</h3>
            {topTwoAbilities.map(({ key, ability }, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2">
                <p className="font-semibold text-gray-800 dark:text-white">{key}</p>
                <p className="text-gray-600 dark:text-gray-300">{ability}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(testResults[ability] || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* 능력 카테고리 */}
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">능력 카테고리</h3>
            <div className="w-full h-64">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          {/* 세부 능력 점수 */}
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">세부 능력 점수</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(sortedTestResults).map(([key, value], index) => (
                <div key={key} className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">{key}: </span>
                  <span>{value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 세부 능력 분포 */}
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">세부 능력 분포</h3>
            <div className="w-full h-96">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Machine Butcher AI */}
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">Machine Butcher AI</h3>
            <div className="w-full h-80 bg-gray-800 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <ThreeDModel testResults={categoryScores} parts={parts} />
              </Canvas>
            </div>
          </div>

          {/* 결과 설명 */}
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">결과 설명</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="whitespace-pre-line">{detailedInterpretation}</p>
            </div>
          </div>

          {/* AI 생성 이미지 */}
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">AI 생성 이미지</h3>
            <div 
              className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer"
              onClick={toggleFullscreen}
            >
              {aiImage ? (
                <img src={aiImage} alt="AI Generated" className="w-full h-full object-contain" />
              ) : (
                <p>{error || "이미지를 생성할 수 없습니다."}</p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button 
                onClick={handleDownloadParts} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={!aiImage}
              >
                Parts 다운로드
              </button>
              <button onClick={handleShareTest} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                테스트 공유하기
              </button>
              <button onClick={onRestart} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                처음으로
              </button>
            </div>
          </div>
        </div>

        {/* 768px 이상 화면용 레이아웃 (기존 레이아웃) */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">발견된 능력</h3>
              {topTwoAbilities.map(({ key, ability }, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2">
                  <p className="font-semibold text-gray-800 dark:text-white">{key}</p>
                  <p className="text-gray-600 dark:text-gray-300">{ability}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{(testResults[ability] || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">세부 능력 점수</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(sortedTestResults).map(([key, value], index) => (
                  <div key={key} className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{key}: </span>
                    <span>{value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">능력 카테고리</h3>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-64">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">Machine Butcher AI</h3>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-80 bg-gray-800 rounded-lg overflow-hidden">
                  <Canvas camera={{ position: [0, 0, 4] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <ThreeDModel testResults={categoryScores} parts={parts} />
                  </Canvas>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">세부 능력 분포</h3>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-96">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">결과 설명</h3>
              <div className="columns-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <p className="whitespace-pre-line">{detailedInterpretation}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">AI 생성 이미지</h3>
              <div 
                className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={toggleFullscreen}
              >
                {aiImage ? (
                  <img src={aiImage} alt="AI Generated" className="w-full h-full object-contain" />
                ) : (
                  <p>{error || "이미지를 생성할 수 없습니다."}</p>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button 
                  onClick={handleDownloadParts} 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={!aiImage}
                >
                  Parts 다운로드
                </button>
                <button onClick={handleShareTest} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                  테스트 공유하기
                </button>
                <button onClick={onRestart} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  처음으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCopied && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-full flex items-center">
            <CheckCircle className="mr-2" />
            Copied
          </div>
        </div>
      )}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={toggleFullscreen}
        >
          <img src={aiImage} alt="AI Generated" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
};

export default ResultPage;