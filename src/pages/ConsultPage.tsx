import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<ConsultFormData>();

  if (authLoading) return <div className="p-8 text-center bg-earth-50 min-h-screen">Loading...</div>;

  if (!userData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-earth-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-earth-100 max-w-lg text-center">
          <Leaf className="w-12 h-12 text-sage-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-earth-800 mb-4">Name Required</h2>
          <p className="text-earth-600 mb-6">Please enter your name to keep track of your health history and receive your remedy.</p>
          <button 
            onClick={() => navigate('/login', { state: { from: { pathname: '/consult' } } })}
            className="w-full bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Enter Name
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ConsultFormData) => {
    setIsSubmitting(true);
    setStatusText('Vaydyan is analyzing your symptoms...');

    try {
      // Formats the contextual data for the AI system
      const payloadContext = {
        chiefComplaint: data.chiefComplaint,
        healthContext: `Age: ${data.age}, Gender/Body type: ${data.gender}, Allergies: ${data.allergies}, Meds: ${data.medications}`,
        lifestyle: `Sleep: ${data.sleepPatterns}, Digestion: ${data.digestion}, Stress: ${data.stressLevels}`
      };

      // 1. Generate Remedy using our backend API
      const res = await fetch('/api/generate-remedy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadContext)
      });

      if (!res.ok) {
        let errorMsg = 'Failed to generate a remedy from our AI system. Please try again.';
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }
      
      const { remedy } = await res.json();
      
      setStatusText('Saving your custom protocol...');

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
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while communicating with the Vaydyan system.';
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
          <h1 className="text-3xl md:text-4xl font-serif text-earth-800 mb-4">Start Your Consultation</h1>
          <p className="text-earth-600">Please provide detailed information so Vaydyan, our AI System, can tailor the perfect Ayurvedic remedy for you.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-earth-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="flex border-b border-earth-100">
            <div className={`flex-1 py-4 text-center font-medium ${step >= 1 ? 'text-sage-700 bg-sage-50' : 'text-earth-400 bg-earth-50'}`}>1. Complaint</div>
            <div className={`flex-1 py-4 text-center font-medium border-l border-earth-100 ${step >= 2 ? 'text-sage-700 bg-sage-50' : 'text-earth-400 bg-earth-50'}`}>2. Context</div>
            <div className={`flex-1 py-4 text-center font-medium border-l border-earth-100 ${step >= 3 ? 'text-sage-700 bg-sage-50' : 'text-earth-400 bg-earth-50'}`}>3. Lifestyle</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12">
            
            {/* Step 1 */}
            <div className={step === 1 ? 'block' : 'hidden'}>
              <h2 className="text-2xl font-serif text-earth-800 mb-6">Chief Complaint</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">What brings you here today?</label>
                  <p className="text-xs text-earth-500 mb-3">Describe your main symptoms, illness, when it started, and any specific triggers.</p>
                  <textarea 
                    {...register('chiefComplaint', { required: 'Please describe your main complaint' })}
                    rows={6}
                    className="w-full border border-earth-300 rounded-md p-4 focus:ring-sage-500 focus:border-sage-500 bg-white"
                    placeholder="e.g. I have been experiencing severe acid reflux and indigestion after meals for the past 3 weeks..."
                  ></textarea>
                  {errors.chiefComplaint && <p className="text-red-500 text-sm mt-1">{errors.chiefComplaint.message}</p>}
                </div>
                <div className="flex justify-end pt-4">
                  <button type="button" onClick={() => setStep(2)} className="bg-earth-800 hover:bg-earth-900 text-white px-8 py-3 rounded-md font-medium transition-colors">
                    Next Step
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={step === 2 ? 'block' : 'hidden'}>
              <h2 className="text-2xl font-serif text-earth-800 mb-6">Health Context</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Age</label>
                  <input type="text" {...register('age')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500" placeholder="e.g. 34" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Gender / Body type</label>
                  <input type="text" {...register('gender')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500" placeholder="Male, Female, Non-binary, etc." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-700 mb-2">Known Allergies</label>
                  <input type="text" {...register('allergies')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500" placeholder="e.g. Peanuts, Penicillin, None" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-700 mb-2">Current Western Medications</label>
                  <textarea rows={2} {...register('medications')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500" placeholder="List any ongoing modern medicines..."></textarea>
                </div>
                <div className="md:col-span-2 flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(1)} className="text-earth-600 hover:text-earth-800 font-medium px-4 py-3">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="bg-earth-800 hover:bg-earth-900 text-white px-8 py-3 rounded-md font-medium transition-colors">Next Step</button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={step === 3 ? 'block' : 'hidden'}>
              <h2 className="text-2xl font-serif text-earth-800 mb-6">Lifestyle (Dosha Analysis)</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Sleep Patterns</label>
                  <select {...register('sleepPatterns')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500 bg-white">
                    <option value="">Select...</option>
                    <option value="Light sleeper, wake up often (Vata)">Light sleeper, wake up often (Vata)</option>
                    <option value="Moderate sleep, vivid dreams (Pitta)">Moderate sleep, vivid dreams (Pitta)</option>
                    <option value="Deep, heavy sleep, hard to wake (Kapha)">Deep, heavy sleep, hard to wake (Kapha)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Digestion & Appetite</label>
                  <select {...register('digestion')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500 bg-white">
                    <option value="">Select...</option>
                    <option value="Irregular, prone to gas/bloating (Vata)">Irregular, prone to gas/bloating (Vata)</option>
                    <option value="Strong, sharp, prone to heartburn (Pitta)">Strong, sharp, prone to heartburn (Pitta)</option>
                    <option value="Slow, steady, prone to sluggishness (Kapha)">Slow, steady, prone to sluggishness (Kapha)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Stress Response</label>
                  <select {...register('stressLevels')} className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500 bg-white">
                    <option value="">Select...</option>
                    <option value="Anxious, worried, racing thoughts (Vata)">Anxious, worried, racing thoughts (Vata)</option>
                    <option value="Irritable, impatient, frustrated (Pitta)">Irritable, impatient, frustrated (Pitta)</option>
                    <option value="Withdrawn, stubborn, unmotivated (Kapha)">Withdrawn, stubborn, unmotivated (Kapha)</option>
                  </select>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6 flex gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Please review your information carefully before submitting. By submitting, you understand this is for holistic wellness purposes.</p>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(2)} className="text-earth-600 hover:text-earth-800 font-medium px-4 py-3">Back</button>
                  <button type="submit" disabled={isSubmitting} className="bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white px-8 py-3 rounded-md font-medium transition-colors shadow-sm flex flex-col items-center justify-center min-w-[200px]">
                    {isSubmitting ? (
                      <span className="text-sm font-semibold">{statusText}</span>
                    ) : (
                      'Consult Vaydyan AI'
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
