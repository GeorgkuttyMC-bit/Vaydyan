import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Leaf, UserCircle, FileSignature } from 'lucide-react';
import { format } from 'date-fns';

interface Consultation {
  id: string;
  status: 'pending' | 'reviewed' | 'completed';
  chiefComplaint: string;
  healthContext: string;
  lifestyle: string;
  remedy?: string;
  createdAt: string;
  updatedAt: string;
  patientName: string;
}

export default function AdminPage() {
  const { userData } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      if (userData?.role !== 'doctor') {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'consultations'));
        const snapshot = await getDocs(q);
        
        const results = snapshot.docs.map((consultDoc) => {
          const data = consultDoc.data();
          return {
            id: consultDoc.id,
            patientName: data.patientName || 'Unknown Patient',
            ...data
          } as Consultation;
        });
        
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

  if (userData?.role !== 'doctor') {
    return <div className="p-8 text-center text-red-500 bg-earth-50 min-h-screen font-medium">Access Denied. Admin privileges required.</div>;
  }

  const getFormatData = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {};
    }
  };

  return (
    <div className="flex-1 bg-earth-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Left Column - List */}
        <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-earth-100 bg-earth-100/50">
            <h2 className="font-serif font-bold text-lg text-earth-800">System Logs / Vaydyan Queue</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <p className="p-4 text-center text-earth-500 text-sm">Loading queue...</p>
            ) : consultations.length === 0 ? (
              <p className="p-4 text-center text-earth-500 text-sm">No consultations found.</p>
            ) : (
              consultations.map(consult => (
                <button
                  key={consult.id}
                  onClick={() => {
                    setSelectedConsult(consult);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-colors border ${
                    selectedConsult?.id === consult.id 
                      ? 'bg-sage-50 border-sage-200' 
                      : 'bg-white border-transparent hover:bg-earth-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-earth-800 line-clamp-1">{consult.patientName}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      consult.status === 'completed' ? 'bg-sage-100 text-sage-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {consult.status}
                    </span>
                  </div>
                  <div className="text-xs text-earth-500 mb-2">{format(new Date(consult.createdAt), 'MMM dd, HH:mm')}</div>
                  <p className="text-sm text-earth-600 line-clamp-2 text-ellipsis">{consult.chiefComplaint}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Detail & Editor */}
        <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden flex flex-col h-full">
          {!selectedConsult ? (
            <div className="flex-1 flex flex-col items-center justify-center text-earth-400 p-8">
              <FileSignature className="w-16 h-16 text-earth-200 mb-4" />
              <p>Select a consultation record to review system generated remedies.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* Header Info */}
              <div className="p-6 border-b border-earth-100 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <UserCircle className="w-10 h-10 text-sage-600" />
                  <div>
                    <h2 className="text-xl font-serif text-earth-800">{selectedConsult.patientName}</h2>
                    <p className="text-sm text-earth-500">Submitted: {format(new Date(selectedConsult.createdAt), 'PPP p')}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-earth-50/30">
                {/* Complaint */}
                <section>
                  <h3 className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">Chief Complaint</h3>
                  <div className="bg-white border text-sm border-earth-200 p-4 rounded-md text-earth-800">
                    {selectedConsult.chiefComplaint}
                  </div>
                </section>

                {/* Context */}
                <section className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-earth-200 p-4 rounded-md">
                    <h3 className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">Health Context</h3>
                    <ul className="text-sm text-earth-700 space-y-1">
                      <li><span className="font-medium">Age:</span> {getFormatData(selectedConsult.healthContext).age || 'N/A'}</li>
                      <li><span className="font-medium">Gender:</span> {getFormatData(selectedConsult.healthContext).gender || 'N/A'}</li>
                      <li><span className="font-medium">Allergies:</span> {getFormatData(selectedConsult.healthContext).allergies || 'None'}</li>
                      <li><span className="font-medium">Meds:</span> {getFormatData(selectedConsult.healthContext).medications || 'None'}</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white border border-earth-200 p-4 rounded-md">
                    <h3 className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">Lifestyle (Dosha)</h3>
                    <ul className="text-sm text-earth-700 space-y-1">
                      <li><span className="font-medium">Sleep:</span> {getFormatData(selectedConsult.lifestyle).sleepPatterns || 'N/A'}</li>
                      <li><span className="font-medium">Digestion:</span> {getFormatData(selectedConsult.lifestyle).digestion || 'N/A'}</li>
                      <li><span className="font-medium">Stress:</span> {getFormatData(selectedConsult.lifestyle).stressLevels || 'N/A'}</li>
                    </ul>
                  </div>
                </section>

                {/* AI Remedy output */}
                <section className="flex flex-col">
                  <h3 className="text-xs font-bold text-sage-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Leaf className="w-4 h-4" /> Vaydyan System Generation Log
                  </h3>
                  <div className="whitespace-pre-wrap text-earth-800 bg-sage-50/30 p-6 rounded-md border border-sage-100 font-sans text-sm leading-relaxed">
                    {(selectedConsult.remedy || 'No remedy generated.').replace(/\*\*/g, '')}
                  </div>
                </section>
              </div>

            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

