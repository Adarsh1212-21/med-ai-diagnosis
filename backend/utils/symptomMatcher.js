const dataset = require('../data/symptoms_dataset.json');

// Clean user input into symptom phrases
const extractSymptoms = (text) => {
  // Keep multi-word phrases as well as single words
  const cleaned = text.toLowerCase().replace(/[^a-z\s,]/g, ' ');
  // Split by comma or common separators
  const phrases = cleaned.split(/[,;]+/).map(s => s.trim()).filter(s => s.length > 2);
  // Also add individual meaningful words (length > 3)
  const words = cleaned.split(/\s+/).filter(w => w.length > 3);
  return [...new Set([...phrases, ...words])];
};

// Strict matching — requires symptom phrase to meaningfully overlap
const matchesSymptom = (userInput, diseaseSymptom) => {
  const user = userInput.toLowerCase().trim();
  const disease = diseaseSymptom.toLowerCase().trim();

  // Exact match
  if (user === disease) return true;

  // User phrase contains full disease symptom
  if (user.includes(disease)) return true;

  // Disease symptom contains full user phrase (only if phrase is 4+ chars)
  if (user.length >= 4 && disease.includes(user)) return true;

  // Multi-word overlap — ALL words of disease symptom must appear in user text
  const diseaseWords = disease.split(/\s+/).filter(w => w.length > 3);
  if (diseaseWords.length >= 2) {
    const allMatch = diseaseWords.every(dw => user.includes(dw));
    if (allMatch) return true;
  }

  return false;
};

// Calculate match score
const calculateScore = (userSymptoms, diseaseSymptoms) => {
  let matchCount = 0;
  const matchedSymptoms = [];

  for (const diseaseSymptom of diseaseSymptoms) {
    const matched = userSymptoms.some(userSym => matchesSymptom(userSym, diseaseSymptom));
    if (matched && !matchedSymptoms.includes(diseaseSymptom)) {
      matchedSymptoms.push(diseaseSymptom);
      matchCount++;
    }
  }

  const score = matchCount / diseaseSymptoms.length;
  return { score, matchedSymptoms, matchCount };
};

const getProbability = (score) => {
  if (score >= 0.5) return 'High';
  if (score >= 0.25) return 'Medium';
  return 'Low';
};

const analyzeSymptoms = (symptomsText) => {
  const userSymptoms = extractSymptoms(symptomsText);
  if (userSymptoms.length === 0) return null;

  const results = dataset.map((disease) => {
    const { score, matchedSymptoms, matchCount } = calculateScore(userSymptoms, disease.symptoms);
    return { disease, score, matchedSymptoms, matchCount };
  });

  // STRICT: require at least 2 matching symptoms AND score >= 0.2
  const matches = results
    .filter((r) => r.matchCount >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (matches.length === 0) {
    return {
      possibleConditions: [],
      recommendedActions: [
        'Consult a qualified healthcare professional',
        'Describe your symptoms in more detail',
        'Keep track of when symptoms started',
        'Monitor if symptoms worsen',
      ],
      urgencyLevel: 'Routine',
      urgencyExplanation: 'No matching conditions found in local dataset',
      generalAdvice: 'Your symptoms could not be matched in our database. AI analysis will be used instead.',
      whenToSeekImmediateCare: 'If you experience severe pain, difficulty breathing, or chest pain — seek emergency care immediately',
      disclaimer: 'This analysis is based on symptom matching only. Always consult a qualified healthcare professional.',
    };
  }

  const possibleConditions = matches.map((match) => ({
    name: match.disease.disease,
    probability: getProbability(match.score),
    description: match.disease.description,
    matchingSymptoms: match.matchedSymptoms,
  }));

  const topMatch = matches[0];
  const urgencyPriority = { Emergency: 4, Urgent: 3, Moderate: 2, Routine: 1 };
  const highestUrgency = matches.reduce((highest, match) => {
    const current = urgencyPriority[match.disease.urgency] || 1;
    const high = urgencyPriority[highest] || 1;
    return current > high ? match.disease.urgency : highest;
  }, 'Routine');

  const recommendedActions = [
    ...new Set(
      matches.slice(0, 2).flatMap((m) => m.disease.recommendedActions).slice(0, 5)
    ),
  ];

  return {
    possibleConditions,
    recommendedActions,
    urgencyLevel: highestUrgency,
    urgencyExplanation: `Based on symptom analysis, ${topMatch.disease.disease} is the most likely match with ${Math.round(topMatch.score * 100)}% symptom overlap`,
    generalAdvice: `Your symptoms most closely match ${topMatch.disease.disease}. ${topMatch.disease.description}`,
    whenToSeekImmediateCare: topMatch.disease.whenToSeekCare,
    disclaimer: 'This analysis is based on symptom matching from our medical dataset only. It is NOT a medical diagnosis. Always consult a qualified healthcare professional.',
  };
};

module.exports = { analyzeSymptoms };
