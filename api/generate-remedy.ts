import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // CORS setup for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel environment variables.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }

    const { chiefComplaint, healthContext, lifestyle } = body || {};

    if (!chiefComplaint) {
       return res.status(400).json({ error: 'Chief complaint is required.'});
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are Vaydyan, an expert Ayurvedic AI system.
    Analyze the following patient data and respond with a structured Ayurvedic remedy protocol.
    Use Markdown with clear headings. Focus on Diagnosis, Dietary Guidelines, Herbal Protocol, and Lifestyle/Yoga modifications.
    
    Patient Complaint: ${chiefComplaint}
    Health Context: ${healthContext}
    Lifestyle & Dosha Attributes: ${lifestyle}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    res.json({ remedy: response.text });
  } catch (error) {
    console.error('Error generating AI remedy:', error);
    res.status(500).json({ error: 'Failed to generate remedy. Details: ' + (error instanceof Error ? error.message : String(error)) });
  }
}
