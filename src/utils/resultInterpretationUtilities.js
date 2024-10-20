// utils/resultInterpretation.js

const abilityDescriptions = {
  perception: "주변 환경과 상황을 빠르게 인지하고 분석하는 능력",
  intelligence: "복잡한 문제를 해결하고 논리적으로 사고하는 능력",
  emotional: "자신과 타인의 감정을 이해하고 적절히 대응하는 능력",
  physical: "신체적 활동을 효과적으로 수행하고 조절하는 능력",
  social: "대인 관계를 형성하고 유지하는 능력",
  creative: "새로운 아이디어를 생성하고 혁신적으로 사고하는 능력",
  spiritual: "삶의 의미와 목적을 탐구하고 내적 평화를 추구하는 능력",
  moral: "윤리적 판단을 내리고 도덕적 행동을 실천하는 능력",
  adaptability: "변화하는 환경에 유연하게 대응하는 능력",
  selfAwareness: "자신의 생각, 감정, 행동을 객관적으로 인식하는 능력",
  timePerception: "시간을 효과적으로 관리하고 계획하는 능력",
  communication: "자신의 생각과 감정을 명확히 표현하고 타인의 의견을 경청하는 능력",
  riskAssessment: "위험을 평가하고 적절한 결정을 내리는 능력",
  culturalSensitivity: "다양한 문화를 이해하고 존중하는 능력"
};

const categoryDescriptions = {
  지각: "환경을 인식하고 정보를 처리하는 능력",
  지성: "논리적 사고와 문제 해결 능력",
  감성: "감정을 이해하고 관리하는 능력",
  육체: "신체적 활동과 운동 능력",
  초감각: "직관과 창의성, 영적 감각을 포함한 고차원적 인지 능력"
};

const getDetailedInterpretation = (testResults, categoryScores) => {
  let interpretation = "";

  // 카테고리 점수 해석
  const topCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0];
  const bottomCategory = Object.entries(categoryScores).sort((a, b) => a[1] - b[1])[0];

  interpretation += `당신의 사이버네틱 능력 테스트 결과, ${topCategory[0]} 영역에서 가장 뛰어난 능력을 보여주셨습니다. 
  이는 ${categoryDescriptions[topCategory[0]]}에서 특히 강점을 가지고 있음을 의미합니다. 
  이 능력은 현대 사회에서 매우 유용하며, 앞으로의 삶에서 큰 강점이 될 것입니다.\n\n`;

  interpretation += `반면, ${bottomCategory[0]} 영역은 상대적으로 낮은 점수를 보이고 있습니다. 
  이는 ${categoryDescriptions[bottomCategory[0]]}에 대한 개발의 여지가 있음을 시사합니다. 
  이 영역을 개선하기 위한 노력이 전반적인 능력 향상에 도움이 될 것입니다.\n\n`;

  // 개별 능력 점수 해석
  const topAbilities = Object.entries(testResults)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  interpretation += "특히 주목할 만한 개별 능력으로는:\n";
  topAbilities.forEach(([ability, score]) => {
    interpretation += `- ${ability} (점수: ${score.toFixed(2)}): ${abilityDescriptions[ability]}\n`;
  });

  interpretation += `\n이러한 능력들은 당신의 강점으로, 이를 활용하여 다양한 상황에서 뛰어난 성과를 낼 수 있을 것입니다.
  
전반적으로 당신은 균형 잡힌 능력 프로필을 보여주고 있습니다. 
강점을 더욱 발전시키는 동시에 상대적으로 낮은 점수를 받은 영역을 개선하는 데 노력을 기울인다면, 
더욱 다재다능하고 적응력 있는 개인으로 성장할 수 있을 것입니다.

이 결과를 바탕으로, 당신의 강점을 활용할 수 있는 활동이나 직업을 탐색해보는 것도 좋은 방법일 것입니다. 
또한, 개선이 필요한 영역에 대해서는 관련 교육이나 훈련 프로그램을 찾아보는 것을 추천드립니다.

기억하세요, 이 테스트 결과는 당신의 현재 상태를 반영한 것이며, 지속적인 노력과 학습을 통해 모든 영역에서 
성장할 수 있는 잠재력을 가지고 있습니다.`;

  return interpretation;
};

export { getDetailedInterpretation, abilityDescriptions };
