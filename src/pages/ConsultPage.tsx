import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Leaf, AlertCircle } from 'lucide-react';

interface ConsultFormData {
  chiefComplaint: string;
  age: string;
  gender: string;
  allergies: string;
  medications: string;
  sleepPatterns: string;
  digestion: string;
  stressLevels: string;
}

export default function ConsultPage() {
  const { userData, loading: authLoading } = useAuth();
  const { language, targetLanguage } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<ConsultFormData>();

  const isDe = language === 'de';
  const texts = {
    loading: isDe ? 'Laden...' : 'Loading...',
    nameReqTitle: isDe ? 'Name erforderlich' : 'Name Required',
    nameReqDesc: isDe ? 'Bitte geben Sie Ihren Namen ein, um Ihre Krankengeschichte zu verfolgen und Ihr Heilmittel zu erhalten.' : 'Please enter your name to keep track of your health history and receive your remedy.',
    enterName: isDe ? 'Name eingeben' : 'Enter Name',
    analyzing: isDe ? 'Vaydyan analysiert Ihre Symptome...' : 'Vaydyan is analyzing your symptoms...',
    saving: isDe ? 'Speichern Sie Ihr benutzerdefiniertes Protokoll...' : 'Saving your custom protocol...',
    errorMsg: isDe ? 'Fehler beim Generieren eines Heilmittels durch unser KI-System. Bitte versuchen Sie es erneut.' : 'Failed to generate a remedy from our AI system. Please try again.',
    errorComm: isDe ? 'Bei der Kommunikation mit dem Vaydyan-System ist ein Fehler aufgetreten.' : 'An error occurred while communicating with the Vaydyan system.',
    title: isDe ? 'Starten Sie Ihre Beratung' : 'Start Your Consultation',
    subtitle: isDe ? 'Bitte machen Sie detaillierte Angaben, damit Vaydyan, unser KI-System, das perfekte ayurvedische Heilmittel für Sie zusammenstellen kann.' : 'Please provide detailed information so Vaydyan, our AI System, can tailor the perfect Ayurvedic remedy for you.',
    step1Tab: isDe ? '1. Beschwerde' : '1. Complaint',
    step2Tab: isDe ? '2. Kontext' : '2. Context',
    step3Tab: isDe ? '3. Lebensstil' : '3. Lifestyle',
    chiefComplaintTitle: isDe ? 'Hauptbeschwerde' : 'Chief Complaint',
    whatBringsYou: isDe ? 'Was führt Sie heute zu uns?' : 'What brings you here today?',
    describeSymptoms: isDe ? 'Beschreiben Sie Ihre Hauptsymptome, Ihre Krankheit, wann sie begonnen hat und etwaige spezifische Auslöser.' : 'Describe your main symptoms, illness, when it started, and any specific triggers.',
    reqComplaint: isDe ? 'Bitte beschreiben Sie Ihre Hauptbeschwerde' : 'Please describe your main complaint',
    placeholderComplaint: isDe ? 'z. B. Ich leide seit 3 Wochen nach den Mahlzeiten unter starkem saurem Reflux und Verdauungsstörungen...' : 'e.g. I have been experiencing severe acid reflux and indigestion after meals for the past 3 weeks...',
    nextStep: isDe ? 'Nächster Schritt' : 'Next Step',
    healthContextTitle: isDe ? 'Gesundheitlicher Kontext' : 'Health Context',
    ageLabel: isDe ? 'Alter' : 'Age',
    genderLabel: isDe ? 'Geschlecht / Körpertyp' : 'Gender / Body type',
    allergiesLabel: isDe ? 'Bekannte Allergien' : 'Known Allergies',
    medsLabel: isDe ? 'Aktuelle westliche Medikamente' : 'Current Western Medications',
    placeholderAge: isDe ? 'z. B. 34' : 'e.g. 34',
    placeholderGender: isDe ? 'Männlich, weiblich, nicht-binär, usw.' : 'Male, Female, Non-binary, etc.',
    placeholderAllergies: isDe ? 'z. B. Erdnüsse, Penicillin, keine' : 'e.g. Peanuts, Penicillin, None',
    placeholderMeds: isDe ? 'Listen Sie alle laufenden modernen Medikamente auf...' : 'List any ongoing modern medicines...',
    back: isDe ? 'Zurück' : 'Back',
    lifestyleTitle: isDe ? 'Lebensstil (Dosha-Analyse)' : 'Lifestyle (Dosha Analysis)',
    sleepLabel: isDe ? 'Schlafgewohnheiten' : 'Sleep Patterns',
    digestionLabel: isDe ? 'Verdauung & Appetit' : 'Digestion & Appetite',
    stressLabel: isDe ? 'Stressreaktion' : 'Stress Response',
    selectOption: isDe ? 'Auswählen...' : 'Select...',
    optSleep1: isDe ? 'Leichter Schlaf, wache oft auf (Vata)' : 'Light sleeper, wake up often (Vata)',
    optSleep2: isDe ? 'Mäßiger Schlaf, lebhafte Träume (Pitta)' : 'Moderate sleep, vivid dreams (Pitta)',
    optSleep3: isDe ? 'Tiefer, schwerer Schlaf, schwer aufzuwachen (Kapha)' : 'Deep, heavy sleep, hard to wake (Kapha)',
    optDig1: isDe ? 'Unregelmäßig, neigt zu Blähungen (Vata)' : 'Irregular, prone to gas/bloating (Vata)',
    optDig2: isDe ? 'Stark, scharf, neigt zu Sodbrennen (Pitta)' : 'Strong, sharp, prone to heartburn (Pitta)',
    optDig3: isDe ? 'Langsam, stetig, neigt zu Trägheit (Kapha)' : 'Slow, steady, prone to sluggishness (Kapha)',
    optStress1: isDe ? 'Ängstlich, besorgt, rasende Gedanken (Vata)' : 'Anxious, worried, racing thoughts (Vata)',
    optStress2: isDe ? 'Reizbar, ungeduldig, frustriert (Pitta)' : 'Irritable, impatient, frustrated (Pitta)',
    optStress3: isDe ? 'Zurückgezogen, stur, unmotiviert (Kapha)' : 'Withdrawn, stubborn, unmotivated (Kapha)',
    warning: isDe ? 'Bitte überprüfen Sie Ihre Angaben sorgfältig, bevor Sie sie absenden. Durch das Absenden erklären Sie sich damit einverstanden, dass dies ganzheitlichen Gesundheitszwecken dient.' : 'Please review your information carefully before submitting. By submitting, you understand this is for holistic wellness purposes.',
    submitBtn: isDe ? 'Vaydyan KI konsultieren' : 'Consult Vaydyan AI'
  };

  if (authLoading) return <div className="p-8 text-center bg-earth-50 min-h-screen">{texts.loading}</div>;

  if (!userData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-earth-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-earth-100 max-w-lg text-center">
          <Leaf className="w-12 h-12 text-sage-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-earth-800 mb-4">{texts.nameReqTitle}</h2>
          <p className="text-earth-600 mb-6">{texts.nameReqDesc}</p>
          <button 
            onClick={() => navigate('/login', { state: { from: { pathname: '/consult' } } })}
            className="w-full bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            {texts.enterName}
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ConsultFormData) => {
    setIsSubmitting(true);
    setStatusText(texts.analyzing);

    try {
      // Formats the contextual data for the AI system
      const payloadContext = {
        chiefComplaint: data.chiefComplaint,
        healthContext: `Age: ${data.age}, Gender/Body type: ${data.gender}, Allergies: ${data.allergies}, Meds: ${data.medications}`,
        lifestyle: `Sleep: ${data.sleepPatterns}, digestion: ${data.digestion}, Stress: ${data.stressLevels}`,
        targetLanguage
      };

      // 1. Generate Remedy using our backend API
      const res = await fetch('/api/generate-remedy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadContext)
      });

      if (!res.ok) {
        let errorMsg = texts.errorMsg;
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }
      
      const { remedy } = await res.json();
      
      setStatusText(texts.saving);

      // 2. Save completed status and full remedy to Firestore
      const consultationId = crypto.randomUUID();
      const docRef = doc(db, 'consultations', consultationId);
      
      const firestorePayload = {
        patientName: userData.displayName,
        status: 'completed',
        chiefComplaint: data.chiefComplaint,
        healthContext: JSON.stringify({
          age: data.age,
          gender: data.gender,
          allergies: data.allergies,
          medications: data.medications
        }),
        lifestyle: JSON.stringify({
          sleepPatterns: data.sleepPatterns,
          digestion: data.digestion,
          stressLevels: data.stressLevels
        }),
        remedy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, firestorePayload);
      navigate('/my-health', { state: { consultationSubmitted: true } });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : texts.errorComm;
      alert(errorMessage);
      if (errorMessage.includes('Missing or insufficient permissions') || errorMessage.includes('Firestore')) {
        handleFirestoreError(error, OperationType.CREATE, 'consultations');
      }
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  return (
    <div className="flex-1 bg-earth-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-serif text-earth-800 mb-4">{texts.title}</h1>
          <p className="text-earth-600">{texts.subtitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-earth-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="flex border-b border-earth-100">
            <div className={`flex-1 py-4 text-center font-medium ${step >= 1 ? 'text-sage-700 bg-sage-50' : 'text-earth-400 bg-earth-50'}`}>{texts.step1Tab}</div>
            <div className={`flex-1 py-4 text-center font-medium border-l border-earth-100 ${step >= 2 ? 'text-sage-700 bg-sage-50' : 'text-earth-400 bg-earth-50'}`}>{texts.step2Tab}</div>
            <div className={`flex-1 py-4 text-center font-medium border-l border-earth-100 ${step >= 3 ? 'text-sage-700 bg-sage-50' : 'text-earth-400 bg-earth-50'}`}>{texts.step3Tab}</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12">
            
            {/* Step 1 */}
            <div className={step === 1 ? 'block' : 'hidden'}>
              <h2 className="text-2xl font-serif text-earth-800 mb-6">{texts.chiefComplaintTitle}</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">{texts.whatBringsYou}</label>
                  <p className="text-xs text-earth-500 mb-3">{texts.describeSymptoms}</p>
                  <textarea 
                    {...register('chiefComplaint', { required: texts.reqComplaint })}
                    rows={6}
                    className="w-full border border-earth-300 rounded-md p-4 focus:ring-sage-500 focus:border-sage-500 bg-white"
                    placeholder={texts.placeholderComplaint}
                  ></textarea>
                  {errors.chiefComplaint && <p className="text-red-500 text-sm mt-1">{errors.chiefComplaint.message}</p>}
                </div>
                <div className="flex justify-end pt-4">
                  <button type="button" onClick={() => setStep(2)} className="bg-earth-800 hover:bg-earth-900 text-white px-8 py-3 rounded-md font-medium transition-colors">
                    {texts.nextStep}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={step === 2 ? 'block' : 'hidden'}>
              <h2 className="text-2xl font-serif text-earth-800 mb-6">{texts.healthContextTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">{texts.ageLabel}</label>
                  <input type="text" {...register('age')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500" placeholder={texts.placeholderAge} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">{texts.genderLabel}</label>
                  <input type="text" {...register('gender')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500" placeholder={texts.placeholderGender} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-700 mb-2">{texts.allergiesLabel}</label>
                  <input type="text" {...register('allergies')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500" placeholder={texts.placeholderAllergies} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-700 mb-2">{texts.medsLabel}</label>
                  <textarea rows={2} {...register('medications')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500" placeholder={texts.placeholderMeds}></textarea>
                </div>
                <div className="md:col-span-2 flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(1)} className="text-earth-600 hover:text-earth-800 font-medium px-4 py-3">{texts.back}</button>
                  <button type="button" onClick={() => setStep(3)} className="bg-earth-800 hover:bg-earth-900 text-white px-8 py-3 rounded-md font-medium transition-colors">{texts.nextStep}</button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={step === 3 ? 'block' : 'hidden'}>
              <h2 className="text-2xl font-serif text-earth-800 mb-6">{texts.lifestyleTitle}</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">{texts.sleepLabel}</label>
                  <select {...register('sleepPatterns')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500 bg-white">
                    <option value="">{texts.selectOption}</option>
                    <option value="Light sleeper, wake up often (Vata)">{texts.optSleep1}</option>
                    <option value="Moderate sleep, vivid dreams (Pitta)">{texts.optSleep2}</option>
                    <option value="Deep, heavy sleep, hard to wake (Kapha)">{texts.optSleep3}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">{texts.digestionLabel}</label>
                  <select {...register('digestion')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500 bg-white">
                    <option value="">{texts.selectOption}</option>
                    <option value="Irregular, prone to gas/bloating (Vata)">{texts.optDig1}</option>
                    <option value="Strong, sharp, prone to heartburn (Pitta)">{texts.optDig2}</option>
                    <option value="Slow, steady, prone to sluggishness (Kapha)">{texts.optDig3}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">{texts.stressLabel}</label>
                  <select {...register('stressLevels')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500 bg-white">
                    <option value="">{texts.selectOption}</option>
                    <option value="Anxious, worried, racing thoughts (Vata)">{texts.optStress1}</option>
                    <option value="Irritable, impatient, frustrated (Pitta)">{texts.optStress2}</option>
                    <option value="Withdrawn, stubborn, unmotivated (Kapha)">{texts.optStress3}</option>
                  </select>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6 flex gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{texts.warning}</p>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(2)} className="text-earth-600 hover:text-earth-800 font-medium px-4 py-3">{texts.back}</button>
                  <button type="submit" disabled={isSubmitting} className="bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white px-8 py-3 rounded-md font-medium transition-colors shadow-sm flex flex-col items-center justify-center min-w-[200px]">
                    {isSubmitting ? (
                      <span className="text-sm font-semibold">{statusText}</span>
                    ) : (
                      texts.submitBtn
                    )}
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
