const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { analyzeSymptoms } = require('../utils/symptomMatcher');

const router = express.Router();

const ML_API = 'http://localhost:5001';


const callGemini = async (symptoms, age, gender, duration) => {
  const prompt = `You are MediAI, a medical AI assistant. Analyze the patient symptoms and respond ONLY with valid JSON.

Patient Information:
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Duration: ${duration || 'Not specified'}
- Symptoms: ${symptoms}

Respond with ONLY this JSON:
{
  "possibleConditions": [
    { "name": "Condition Name", "probability": "High", "description": "Brief description", "matchingSymptoms": ["symptom1"] }
  ],
  "recommendedActions": ["Action 1", "Action 2"],
  "urgencyLevel": "Routine",
  "urgencyExplanation": "Why this urgency level",
  "generalAdvice": "General health advice",
  "whenToSeekImmediateCare": "Warning signs to watch for",
  "aiSummary": "2-3 sentence AI analysis",
  "keyWarning": "",
  "confidence": "High",
  "disclaimer": "This is not medical advice. Always consult a qualified doctor."
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
      }),
    }
  );
  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Gemini response');
  return JSON.parse(jsonMatch[0]);
};

const callMLModel = async (symptomsText) => {
  const symptomsList = symptomsText
    .toLowerCase()
    .replace(/[^a-z\s,]/g, ' ')
    .split(/[,\s]+/)
    .filter(s => s.length > 2);

  const response = await fetch(`${ML_API}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: symptomsList }),
  });

  if (!response.ok) throw new Error('ML API not available');
  return await response.json();
};


const isMLAvailable = async () => {
  try {
    const response = await fetch(`${ML_API}/health`);
    return response.ok;
  } catch {
    return false;
  }
};


router.post('/analyze', protect, async (req, res) => {
  try {
    const { symptoms, age, gender, duration } = req.body;

    if (!symptoms || symptoms.trim().length < 3) {
      return res.status(400).json({ message: 'Please describe your symptoms in detail' });
    }

    let finalResult;
    const hasGemini = process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

    
    let mlAvailable = await isMLAvailable();

    if (mlAvailable) {
      try {
        console.log('🤖 Step 1: Running ML Model prediction...');
        const mlResult = await callMLModel(symptoms);

        console.log(`✅ ML Model predicted: ${mlResult.prediction} (${mlResult.confidence}% confidence)`);

     
        const possibleConditions = mlResult.top5
          ?.filter(d => d.confidence > 1)
          ?.map(d => ({
            name: d.disease,
            probability: d.confidence >= 50 ? 'High' : d.confidence >= 20 ? 'Medium' : 'Low',
            description: d.description || `ML model identified ${d.disease} based on your symptoms`,
            matchingSymptoms: mlResult.symptoms_matched || [],
          })) || [];

        finalResult = {
          possibleConditions,
          recommendedActions: mlResult.top5?.[0]?.precautions?.length
            ? mlResult.top5[0].precautions
            : ['Consult a qualified healthcare professional', 'Monitor your symptoms closely'],
          urgencyLevel: mlResult.confidence >= 70 ? 'Moderate' : 'Routine',
          urgencyExplanation: `ML model predicted ${mlResult.prediction} with ${mlResult.confidence}% confidence`,
          generalAdvice: mlResult.description || `Based on ML analysis, your symptoms most closely match ${mlResult.prediction}`,
          whenToSeekImmediateCare: 'If symptoms worsen significantly, seek immediate medical care',
          disclaimer: 'This prediction is from a trained ML model. It is NOT a medical diagnosis. Always consult a qualified healthcare professional.',
          mlInsights: {
            prediction: mlResult.prediction,
            confidence: mlResult.confidence,
            symptomsMatched: mlResult.symptoms_matched,
            symptomsUnmatched: mlResult.symptoms_unmatched,
          },
          analysisMode: 'ML Model',
        };

      } catch (mlErr) {
        console.log('⚠️ ML Model failed:', mlErr.message);
        mlAvailable = false;
      }
    }

   
    if (!finalResult) {
      console.log('🔬 Step 2: Running dataset matching...');
      const datasetResult = analyzeSymptoms(symptoms);
      const datasetFound = datasetResult.possibleConditions.length > 0;

      if (datasetFound) {
        console.log(`✅ Dataset found ${datasetResult.possibleConditions.length} matches`);
        finalResult = { ...datasetResult, analysisMode: 'Dataset' };
      } else {
        // STEP 3 — If dataset failed, try Gemini
        console.log('⚠️ No dataset match — trying Gemini AI...');
        if (hasGemini) {
          try {
            const geminiResult = await callGemini(symptoms, age, gender, duration);
            console.log('✅ Gemini analysis complete!');
            finalResult = {
              ...geminiResult,
              aiInsights: {
                aiSummary: geminiResult.aiSummary,
                keyWarning: geminiResult.keyWarning,
                confidence: geminiResult.confidence,
              },
              analysisMode: 'Gemini AI',
            };
          } catch (geminiErr) {
            console.log('❌ Gemini failed:', geminiErr.message);
            finalResult = { ...datasetResult, analysisMode: 'Dataset' };
          }
        } else {
          finalResult = { ...datasetResult, analysisMode: 'Dataset' };
        }
      }
    }

    
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        diagnosisHistory: {
          symptoms,
          diagnosis: JSON.stringify(finalResult),
          timestamp: new Date(),
        },
      },
    });

    res.json({
      success: true,
      diagnosis: finalResult,
      analyzedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Diagnosis error:', error.message);
    res.status(500).json({ message: error.message || 'Error analyzing symptoms' });
  }
});


router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('diagnosisHistory');
    res.json({
      success: true,
      history: user.diagnosisHistory.reverse().slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

module.exports = router;
