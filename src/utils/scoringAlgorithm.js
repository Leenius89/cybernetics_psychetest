const calculateResults = (answers) => {
  const complexes = {
    perception: 0,
    intelligence: 0,
    emotional: 0,
    physical: 0,
    social: 0,
    creative: 0,
    spiritual: 0,
    moral: 0,
    adaptability: 0,
    selfAwareness: 0,
    timePerception: 0,
    communication: 0,
    riskAssessment: 0,
    culturalSensitivity: 0
  };

  const complexMapping = [
    'perception', 'intelligence', 'emotional', 'physical', 'social',
    'creative', 'spiritual', 'moral', 'adaptability', 'selfAwareness',
    'timePerception', 'communication', 'riskAssessment', 'culturalSensitivity'
  ];

  answers.forEach((answer, index) => {
    const complexIndex = Math.floor(index / 5);
    const complex = complexMapping[complexIndex];
    complexes[complex] += answer;
  });

  // Normalize scores
  Object.keys(complexes).forEach(key => {
    complexes[key] = (complexes[key] / 25) * 100; // 5 questions per complex, max score of 25
  });

  return complexes;
};

const interpretResults = (complexes) => {
  const interpretation = {};
  const threshold = 70; // Threshold for considering a complex significant

  Object.entries(complexes).forEach(([complex, score]) => {
    if (score >= threshold) {
      interpretation[complex] = getComplexInterpretation(complex, score);
    }
  });

  return interpretation;
};

const getComplexInterpretation = (complex, score) => {
  const interpretations = {
    perception: "당신은 주변 환경과 타인의 미세한 변화를 감지하는 능력이 뛰어납니다. 이는 직관력과 통찰력으로 이어질 수 있습니다.",
    intelligence: "당신은 분석적이고 논리적인 사고 능력이 탁월합니다. 복잡한 문제 해결과 추상적 개념 이해에 강점을 가지고 있습니다.",
    emotional: "당신은 감정 지능이 높습니다. 자신과 타인의 감정을 잘 이해하고 관리하며, 공감 능력이 뛰어납니다.",
    physical: "당신은 신체적 능력과 신체 인식이 뛰어납니다. 운동 능력, 체력, 그리고 신체적 자각에 강점을 가지고 있습니다.",
    social: "당신은 사회적 상황에서 뛰어난 적응력을 보입니다. 대인 관계 형성과 유지, 리더십 발휘에 탁월한 능력을 가지고 있습니다.",
    creative: "당신은 창의적이고 혁신적인 사고 능력이 뛰어납니다. 독창적인 아이디어 창출과 예술적 표현에 강점을 가지고 있습니다.",
    spiritual: "당신은 영적이고 철학적인 측면에 깊은 관심을 가지고 있습니다. 삶의 의미와 우주의 신비에 대한 깊은 통찰력을 가지고 있습니다.",
    moral: "당신은 강한 윤리 의식과 도덕적 가치관을 가지고 있습니다. 정의와 공정성에 대한 깊은 이해와 실천 의지를 보여줍니다.",
    adaptability: "당신은 변화하는 환경에 빠르게 적응하는 능력이 뛰어납니다. 유연성과 회복력이 강점입니다.",
    selfAwareness: "당신은 자기 인식 능력이 뛰어납니다. 자신의 감정, 생각, 행동에 대한 깊은 이해와 통찰력을 가지고 있습니다.",
    timePerception: "당신은 시간에 대한 독특한 인식과 관리 능력을 가지고 있습니다. 과거, 현재, 미래를 균형 있게 바라보는 능력이 있습니다.",
    communication: "당신은 뛰어난 의사소통 능력을 가지고 있습니다. 명확한 표현과 효과적인 경청 능력이 강점입니다.",
    riskAssessment: "당신은 위험을 평가하고 관리하는 능력이 뛰어납니다. 불확실한 상황에서도 냉철한 판단력을 발휘할 수 있습니다.",
    culturalSensitivity: "당신은 문화적 다양성에 대한 높은 이해와 수용력을 가지고 있습니다. 다문화 환경에서 뛰어난 적응력을 보입니다."
  };

  return interpretations[complex];
};

const extractParts = (results) => {
  const parts = {
    지각: [],
    지성: [],
    감성: [],
    육체: [],
    hidden: []
  };

  if (results.perception > 60) parts.지각.push('동체시력이 빨라짐');
  if (results.perception > 70) parts.지각.push('시력이 좋아짐');
  if (results.perception > 80) parts.지각.push('냄새를 잘 맡게됨');
  if (results.perception > 90) parts.지각.push('맛을 세분화하여 잘 느끼게 됨');

  if (results.intelligence > 60) parts.지성.push('논리적 사고력 증대');
  if (results.intelligence > 70) parts.지성.push('기억력이 좋아짐');
  if (results.intelligence > 80) parts.지성.push('수사학, 언어의 스킬');
  if (results.intelligence > 90) parts.지성.push('개념, 추상적인 것들에 대한 이해도가 높아짐');

  if (results.emotional > 60) parts.감성.push('공감능력');
  if (results.emotional > 70) parts.감성.push('카리스마');
  if (results.emotional > 80) parts.감성.push('감정 조절 능력');
  if (results.emotional > 90) parts.감성.push('미적 감각');

  if (results.physical > 60) parts.육체.push('체력, 지치지 않는다');
  if (results.physical > 70) parts.육체.push('근육 강화, 힘의 강화');
  if (results.physical > 80) parts.육체.push('신체의 유연성, 탄력성');
  if (results.physical > 90) parts.육체.push('반응속도');

  if (results.hidden > 60) parts.hidden.push('직관력 향상');
  if (results.hidden > 80) parts.hidden.push('소름, 보이지않는 무언가를 느끼게 된다');

  return parts;
};

export { calculateResults, interpretResults, extractParts };