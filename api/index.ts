import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/generate-remedy', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const { chiefComplaint, healthContext, lifestyle } = req.body;

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are Vaydyan, an expert Ayurvedic AI system.
    Analyze the following patient data and respond with a structured Ayurvedic remedy protocol.
    Use Markdown with clear headings. Focus on Diagnosis, Dietary Guidelines, Herbal Protocol, and Lifestyle/Yoga modifications.
    
    Patient Complaint: ${chiefComplaint}
    Health Context: ${healthContext}
    Lifestyle & Dosha Attributes: ${lifestyle}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.json({ remedy: response.text });
  } catch (error) {
    console.error('Error generating AI remedy:', error);
    res.status(500).json({ error: 'Failed to generate remedy.' });
  }
});

export default app;
