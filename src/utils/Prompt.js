const abilityColors = {
    perception: { hex: "#982B1C", name: "Deep Red" },
    intelligence: { hex: "#1230AE", name: "Royal Blue" },
    emotional: { hex: "#F0A8D0", name: "Soft Pink" },
    physical: { hex: "#739072", name: "Sage Green" },
    social: { hex: "#257180", name: "Teal" },
    creative: { hex: "#00FF9C", name: "Bright Mint" },
    spiritual: { hex: "#B7E0FF", name: "Light Sky Blue" },
    moral: { hex: "#B5C0D0", name: "Soft Gray" },
    adaptability: { hex: "#F5F7F8", name: "Off White" },
    selfAwareness: { hex: "#607274", name: "Slate Gray" },
    timePerception: { hex: "#399918", name: "Forest Green" },
    communication: { hex: "#FFF100", name: "Bright Yellow" },
    riskAssessment: { hex: "#EB8317", name: "Orange" },
    culturalSensitivity: { hex: "#E78F81", name: "Coral" }
  };
  
  const categoryMaterials = {
    지각: "chrome",
    지성: "steel",
    감성: "translucent shell",
    육체: "carbon fiber",
    초감각: "LED-embedded material"
  };
  
  export const generatePrompt = (testResults, categoryScores) => {
    const basePrompt = "Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding. Retro futuristic style.";
  
    // 가장 높은 능력 점수 찾기
    const topAbility = Object.entries(testResults).reduce((a, b) => (testResults[a[0]] > testResults[b[0]]) ? a : b)[0];
    const topColor = abilityColors[topAbility];
  
    // 가장 높은 카테고리 점수 찾기
    const topCategory = Object.entries(categoryScores).reduce((a, b) => categoryScores[a[0]] > categoryScores[b[0]] ? a : b)[0];
    const topMaterial = categoryMaterials[topCategory];
  
    // 추가 설명 생성
    const colorPrompt = `The main color scheme is ${topColor.name} (${topColor.hex}).`;
    const materialPrompt = `The primary material is ${topMaterial}${topCategory === '초감각' ? " with glowing effects" : ""}.`;
  
    // 최종 프롬프트 조합
    return `${basePrompt} ${colorPrompt} ${materialPrompt}`.trim();
  };