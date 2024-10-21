import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PsycheTest = ({ questions, onAnswerChange, onComplete, onAnswerComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [progress, setProgress] = useState(0);
  const audioRefs = useRef([]);

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  useEffect(() => {
    // Preload all interface sounds
    for (let i = 1; i <= 11; i++) {
      const audio = new Audio(`/sounds/buttonsounds/interface${i}.mp3`);
      audioRefs.current.push(audio);
    }
  }, []);

  useEffect(() => {
    for (let i = 1; i <= 11; i++) {
      const audio = new Audio(`/sounds/buttonsounds/interface${i}.mp3`);
      audio.volume = 0.5; // Set volume to 50% (adjust this value as needed)
      audioRefs.current.push(audio);
    }
  }, []);

  const playRandomInterfaceSound = () => {
    const randomIndex = Math.floor(Math.random() * audioRefs.current.length);
    const audio = audioRefs.current[randomIndex];
    audio.currentTime = 0; // Reset the audio to the beginning
    audio.play().catch(error => console.error('Error playing audio:', error));
  };

  const handleAnswer = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
    onAnswerChange(questionIndex, value);
    
    playRandomInterfaceSound();
    onAnswerComplete();
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isLastPage = currentPage === totalPages - 1;

  const renderQuestions = () => {
    const startIndex = currentPage * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, questions.length);

    return questions.slice(startIndex, endIndex).map((question, index) => {
      const questionIndex = startIndex + index;
      return (
        <div key={questionIndex} className="mb-8">
          <p className="text-lg font-semibold mb-4">
            {questionIndex + 1}. {question}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm">전혀 그렇지 않다</span>
            <div className="flex items-center space-x-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(questionIndex, value)}
                  className={`rounded-full transition-all ${
                    answers[questionIndex] === value ? 'bg-blue-500' : 'bg-gray-300'
                  } w-6 h-6`}
                />
              ))}
            </div>
            <span className="text-sm">매우 그렇다</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="mt-8 md:mt-16">
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% 완료</p>
      </div>
      {renderQuestions()}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded text-lg disabled:bg-gray-300"
        >
          <ChevronLeft className="w-6 h-6 mr-2" />
          이전
        </button>
        {isLastPage ? (
          <button
            onClick={onComplete}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded text-lg"
          >
            완료
          </button>
        ) : (
          <button
            onClick={nextPage}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded text-lg"
          >
            다음
            <ChevronRight className="w-6 h-6 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PsycheTest;