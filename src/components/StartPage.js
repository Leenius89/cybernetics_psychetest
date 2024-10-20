import React, { useState } from 'react';

const StartPage = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      onStart(name);
    } else {
      alert('이름을 입력해주세요.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200">
      <div className="mb-8 text-center">
        <img src="/images/machinebutcher_logo.jpg" alt="Machine Butcher Corp Logo" className="mx-auto mb-4" />
        <h2 className="text-4xl font-bold mb-6 text-light-text dark:text-dark-text">Machine Butcher Corp</h2>
      </div>
      <h3 className="text-3xl font-bold mb-6 text-center text-light-text dark:text-dark-text">사이버네틱 심리 테스트</h3>
      <p className="mb-6 text-lg text-light-text dark:text-dark-text">
        이 테스트는 당신의 사이버네틱 능력을 측정하기 위해 설계되었습니다. 
        현대 사회에서 기술과 인간의 상호작용이 더욱 중요해짐에 따라, 
        개인의 사이버네틱 적응력을 이해하는 것이 필수적입니다. 
        이 테스트를 통해 당신의 지각, 인지, 감정, 물리적 능력의 균형을 파악하고, 
        잠재된 능력을 발견할 수 있습니다.
      </p>
      <div className="mb-6">
        <label htmlFor="name" className="block mb-2 text-light-text dark:text-dark-text">이름</label>
        <input 
          type="text" 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full p-2 border rounded bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="이름을 입력하세요"
        />
      </div>
      <button 
        onClick={handleStart}
        className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition-colors duration-300"
      >
        테스트 시작
      </button>
    </div>
  );
};

export default StartPage;