import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Leaf, Clock, CheckCircle, Volume2, Square } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

interface Consultation {
  id: string;
  status: 'pending' | 'reviewed' | 'completed';
  chiefComplaint: string;
  createdAt: string;
  remedy?: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { userData } = useAuth();
  const location = useLocation();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(location.state?.consultationSubmitted || false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => setSuccessMessage(false), 5000);
    }
  }, [successMessage]);

  useEffect(() => {
    // Stop speaking when unmounting
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text to speech!");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      
      const cleanText = text.replace(/[*#]/g, ''); // Remove some markdown characters for better reading
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!userData?.displayName) {
         setLoading(false);
         return;
      }
      try {
        const q = query(
          collection(db, 'consultations'),
          where('patientName', '==', userData.displayName)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Consultation[];
        
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setConsultations(results);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'consultations');
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, [userData]);

  if (!userData?.displayName) {
    return <div className="p-8 text-center bg-earth-50 min-h-screen">Loading or unauthorized...</div>;
  }

  return (
    <div className="flex-1 bg-earth-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-earth-800 mb-2">Welcome, {userData.displayName}</h1>
            <p className="text-earth-600">Track your healing journey and access your Ayurvedic remedies.</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-8 p-4 bg-sage-100 border border-sage-200 text-sage-800 rounded-md flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>Your consultation was processed successfully by Vaydyan. Review your AI-generated protocol below.</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-earth-500">Loading your consultations...</div>
        ) : consultations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-earth-100 p-12 text-center">
            <Leaf className="w-16 h-16 text-earth-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-earth-800 mb-2">No Consultations Yet</h3>
            <p className="text-earth-500 mb-6 max-w-md mx-auto">Start your journey toward optimal health by submitting your first consultation request to Vaydyan AI.</p>
            <a href="/consult" className="inline-block bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
              Start AI Consultation
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-xl font-serif text-earth-800 mb-4 border-b border-earth-200 pb-2">My Remedies & Consultations</h2>
            <div className="grid grid-cols-1 gap-6">
              {consultations.map(consult => (
                <div key={consult.id} className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-earth-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-earth-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        consult.status === 'completed' || consult.status === 'reviewed' ? 'bg-sage-100 text-sage-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {consult.status === 'completed' || consult.status === 'reviewed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-sm text-earth-500 font-medium tracking-wide py-0.5">
                          {format(new Date(consult.createdAt), 'MMM dd, yyyy')}
                        </span>
                        <div className="font-medium text-earth-800 capitalize mt-0.5">Status: {consult.status}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-sm font-semibold text-earth-500 uppercase tracking-wider mb-2">Chief Complaint</h3>
                    <p className="text-earth-800 leading-relaxed max-w-3xl mb-6 bg-earth-50 p-4 rounded-md border border-earth-100">
                      {consult.chiefComplaint}
                    </p>

                    {consult.remedy ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-sage-700 uppercase tracking-wider flex items-center gap-2">
                            <Leaf className="w-4 h-4" /> Vaydyan AI Protocol
                          </h3>
                          <button
                            onClick={() => handleSpeak(consult.id, consult.remedy || '')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              speakingId === consult.id 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                : 'bg-sage-50 text-sage-700 hover:bg-sage-100 border border-sage-200'
                            }`}
                          >
                            {speakingId === consult.id ? (
                              <><Square className="w-4 h-4 fill-current" /> Stop Reading</>
                            ) : (
                              <><Volume2 className="w-4 h-4" /> Read Aloud</>
                            )}
                          </button>
                        </div>
                        <div className="whitespace-pre-wrap text-earth-800 bg-sage-50/30 p-6 rounded-md border border-sage-100 font-sans text-sm md:text-base leading-relaxed">
                          {consult.remedy.replace(/\*\*/g, '')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-earth-500 italic text-sm mt-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> 
                        Our Vaydyan AI system is carefully analyzing your dosha and crafting your personalized protocol. Please refresh in a moment.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
