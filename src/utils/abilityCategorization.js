const abilityCategories = {
  지각: ['perception', 'timePerception'],
  지성: ['intelligence', 'communication', 'riskAssessment'],
  감성: ['emotional', 'social', 'culturalSensitivity'],
  육체: ['physical', 'adaptability'],
  초감각: ['creative', 'spiritual', 'moral', 'selfAwareness']
};

const getCategoryForAbility = (ability) => {
  for (const [category, abilities] of Object.entries(abilityCategories)) {
    if (abilities.includes(ability)) {
      return category;
    }
  }
  return null;
};

const calculateCategoryScores = (testResults) => {
  const categoryScores = {
    지각: 0,
    지성: 0,
    감성: 0,
    육체: 0,
    초감각: 0
  };

  Object.entries(testResults).forEach(([ability, score]) => {
    const category = getCategoryForAbility(ability);
    if (category) {
      categoryScores[category] += score;
    }
  });

  // Normalize scores
  Object.keys(categoryScores).forEach(category => {
    const abilitiesCount = abilityCategories[category].length;
    categoryScores[category] /= abilitiesCount;
  });

  return categoryScores;
};

export { abilityCategories, getCategoryForAbility, calculateCategoryScores };
