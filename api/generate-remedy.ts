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

    const { chiefComplaint, healthContext, lifestyle, targetLanguage = 'Malayalam' } = body || {};

    if (!chiefComplaint) {
       return res.status(400).json({ error: 'Chief complaint is required.'});
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const isGerman = targetLanguage === 'German';
    const langDisplay = isGerman ? 'German' : 'Malayalam';
    
    // Set up the second language string for the disclaimer
    let secondLangDisclaimer = "";
    if (isGerman) {
        secondLangDisclaimer = `German: "*Haftungsausschluss: Ich bin kein Arzt, sondern Ihr KI-Assistent, der unsere traditionelle ayurvedische Kultur und KI-Fähigkeiten für ein gutes Leben nutzt. Bitte konsultieren Sie einen Arzt, bevor Sie mit der Medikation beginnen.*"`;
    } else {
        secondLangDisclaimer = `Malayalam: "*ഡിസ്ക്ലെയിമർ: ഞാൻ ഒരു ഡോക്ടർ അല്ല, മറിച്ച് നമ്മുടെ പരമ്പരാഗത ആയുർവേദ സംസ്കാരവും നിർമ്മിത ബുദ്ധിയും ഉപയോഗിച്ച് നല്ല ജീവിതത്തിനായി നിങ്ങളെ സഹായിക്കുന്ന നിങ്ങളുടെ AI അസിസ്റ്റൻ്റ് ആണ്. മരുന്നുകൾ ആരംഭിക്കുന്നതിന് മുമ്പ് ദയവായി ഒരു ഡോക്ടറെ സമീപിക്കുക.*"`;
    }

    const prompt = `You are Vaydyan, an expert Ayurvedic AI system.
    Analyze the following patient data and respond with a structured Ayurvedic remedy protocol.
    Use Markdown with clear headings. Focus on Diagnosis, Dietary Guidelines, Herbal Protocol, and Lifestyle/Yoga modifications.
    
    IMPORTANT: Please provide the entire response in two languages: first in English, followed by a clear divider (like ---), and then in ${langDisplay}.
    
    CRITICAL DISCLAIMER REQUIREMENT:
    At the very end of both the English and the ${langDisplay} sections, you MUST include the following disclaimer:
    English: "*Disclaimer: I am not a doctor, but your AI Assistant using our traditional Ayurvedic culture and AI Capabilities for our good life. Please consult a doctor before starting the medication.*"
    ${secondLangDisclaimer}

    Patient Complaint: ${chiefComplaint}
    Health Context: ${healthContext}
    Lifestyle & Dosha Attributes: ${lifestyle}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    res.json({ remedy: response.text });
  } catch (error) {
    console.error('Error generating AI remedy:', error);
    res.status(500).json({ error: 'Failed to generate remedy. Details: ' + (error instanceof Error ? error.message : String(error)) });
  }
}
