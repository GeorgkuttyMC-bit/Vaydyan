import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Leaf, UserCircle, FileSignature, Volume2, Square } from 'lucide-react';
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
  const { language } = useLanguage();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isDe = language === 'de';

  const texts = {
    unsupportedSpeech: isDe ? "Tut mir leid, Ihr Browser unterstützt Text-to-Speech nicht!" : "Sorry, your browser doesn't support text to speech!",
    accessDenied: isDe ? 'Zugriff verweigert. Administratorrechte erforderlich.' : 'Access Denied. Admin privileges required.',
    unknownPatient: isDe ? 'Unbekannter Patient' : 'Unknown Patient',
    totalPatients: isDe ? 'Patienten Gesamt' : 'Total Patients',
    consultationsStr: isDe ? 'Konsultationen' : 'Consultations',
    systemLogsTitle: isDe ? 'Systemprotokolle / Vaydyan Warteschlange' : 'System Logs / Vaydyan Queue',
    searchPlaceholder: isDe ? 'Patienten oder Beschwerden suchen...' : 'Search patients or complaints...',
    loadingQueue: isDe ? 'Warteschlange wird geladen...' : 'Loading queue...',
    noConsults: isDe ? 'Keine Konsultationen gefunden.' : 'No consultations found.',
    selectRecord: isDe ? 'Wählen Sie einen Beratungsdatensatz aus, um vom System generierte Heilmittel zu überprüfen.' : 'Select a consultation record to review system generated remedies.',
    submitted: isDe ? 'Eingereicht' : 'Submitted',
    deleteConfirm: isDe ? 'Sind Sie sicher, dass Sie diesen Beratungsdatensatz löschen möchten? Dies kann nicht rückgängig gemacht werden.' : 'Are you sure you want to delete this consultation record? This cannot be undone.',
    deleteRecord: isDe ? 'Eintrag löschen' : 'Delete Record',
    chiefComplaint: isDe ? 'Hauptbeschwerde' : 'Chief Complaint',
    healthContext: isDe ? 'Gesundheitlicher Kontext' : 'Health Context',
    age: isDe ? 'Alter' : 'Age',
    gender: isDe ? 'Geschlecht' : 'Gender',
    allergies: isDe ? 'Allergien' : 'Allergies',
    meds: isDe ? 'Medikamente' : 'Meds',
    none: isDe ? 'Keine' : 'None',
    lifestyle: isDe ? 'Lebensstil (Dosha)' : 'Lifestyle (Dosha)',
    sleep: isDe ? 'Schlaf' : 'Sleep',
    digestion: isDe ? 'Verdauung' : 'Digestion',
    stress: isDe ? 'Stress' : 'Stress',
    genLog: isDe ? 'Vaydyan System-Generierungsprotokoll' : 'Vaydyan System Generation Log',
    stop: isDe ? 'Stopp' : 'Stop',
    readAloud: isDe ? 'Vorlesen' : 'Read Aloud',
    noRemedy: isDe ? 'Kein Heilmittel generiert.' : 'No remedy generated.'
  };

  useEffect(() => {
    // Stop speaking when unmounting
    return () => {
      if ('speechSynthesis' in window) {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert(texts.unsupportedSpeech);
      return;
    }

    if (speakingId === id) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      window.speechSynthesis.cancel();
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      let textToSpeak = text;
      // Extract Malayalam part if exists using regex
      const malayalamIndex = text.search(/[\u0D00-\u0D7F]/);
      if (malayalamIndex !== -1) {
         const previousNewline = text.lastIndexOf('\n', malayalamIndex);
         textToSpeak = text.substring(previousNewline === -1 ? 0 : previousNewline).trim();
      } else if (text.includes('---')) {
         textToSpeak = text.split('---').pop()?.trim() || text;
      }

      const cleanText = textToSpeak.replace(/[*#]/g, '').trim();
      
      // Fallback chunking: Split by punctuation to prevent long text from cutting off on mobile Chrome/Safari
      const chunks = cleanText.match(/[^.!?\n]+[.!?\n]*/g) || [cleanText];
      
      setSpeakingId(id);

      let currentChunk = 0;
      const playNext = () => {
         if (abortController.signal.aborted) return;
         
         if (currentChunk < chunks.length && chunks[currentChunk].trim().length > 0) {
            const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
            utterance.lang = malayalamIndex !== -1 ? 'ml-IN' : (text.includes('Haftungsausschluss') ? 'de-DE' : 'en-US'); 
            
            utterance.onend = () => {
               if (abortController.signal.aborted) return;
               currentChunk++;
               playNext();
            };
            
            utterance.onerror = (e) => {
               if (e.error !== 'interrupted' && e.error !== 'canceled') {
                  console.error("Speech error", e);
               }
               if (currentChunk === chunks.length - 1 || abortController.signal.aborted) {
                  setSpeakingId(null);
               } else {
                  currentChunk++;
                  playNext();
               }
            };
            
            window.speechSynthesis.speak(utterance);
         } else {
            setSpeakingId(null);
         }
      };

      setTimeout(() => playNext(), 50);
    }
  };

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
            patientName: data.patientName || texts.unknownPatient,
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
  }, [userData, language]); // added language to trigger unknownPatient update if needed

  if (userData?.role !== 'doctor') {
    return <div className="p-8 text-center text-red-500 bg-earth-50 min-h-screen font-medium">{texts.accessDenied}</div>;
  }

  const getFormatData = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {};
    }
  };

  const uniqueUsersCount = new Set(consultations.map(c => (c.patientName || '').trim().toLowerCase())).size;
  const totalConsultations = consultations.length;

  return (
    <div className="flex-1 bg-earth-50 py-8 px-4 sm:px-6 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 h-[calc(100vh-100px)]">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-earth-500 uppercase tracking-wider mb-1">{texts.totalPatients}</h3>
               <p className="text-3xl font-serif font-bold text-sage-700">{uniqueUsersCount}</p>
             </div>
             <div className="w-12 h-12 bg-sage-50 rounded-full flex items-center justify-center">
               <UserCircle className="w-6 h-6 text-sage-600" />
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-earth-500 uppercase tracking-wider mb-1">{texts.consultationsStr}</h3>
               <p className="text-3xl font-serif font-bold text-sage-700">{totalConsultations}</p>
             </div>
             <div className="w-12 h-12 bg-sage-50 rounded-full flex items-center justify-center">
               <FileSignature className="w-6 h-6 text-sage-600" />
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
          {/* Left Column - List */}
          <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-earth-100 bg-earth-100/50 flex flex-col gap-3 shrink-0">
            <h2 className="font-serif font-bold text-lg text-earth-800">{texts.systemLogsTitle}</h2>
            <input 
              type="text" 
              placeholder={texts.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-earth-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-sage-500"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <p className="p-4 text-center text-earth-500 text-sm">{texts.loadingQueue}</p>
            ) : consultations.length === 0 ? (
              <p className="p-4 text-center text-earth-500 text-sm">{texts.noConsults}</p>
            ) : (
              consultations
              .filter(c => 
                c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                c.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(consult => (
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
              <p>{texts.selectRecord}</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* Header Info */}
              <div className="p-6 border-b border-earth-100 shrink-0">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-10 h-10 text-sage-600" />
                      <div>
                        <h2 className="text-xl font-serif text-earth-800">{selectedConsult.patientName}</h2>
                        <p className="text-sm text-earth-500">{texts.submitted}: {format(new Date(selectedConsult.createdAt), 'PPP p')}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm(texts.deleteConfirm)) {
                          try {
                            const { deleteDoc, doc } = await import('firebase/firestore');
                            await deleteDoc(doc(db, 'consultations', selectedConsult.id));
                            setConsultations(prev => prev.filter(c => c.id !== selectedConsult.id));
                            setSelectedConsult(null);
                          } catch (error) {
                            handleFirestoreError(error, OperationType.DELETE, 'consultations');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium text-sm transition-colors"
                    >
                      {texts.deleteRecord}
                    </button>
                  </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-earth-50/30">
                {/* Complaint */}
                <section>
                  <h3 className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">{texts.chiefComplaint}</h3>
                  <div className="bg-white border text-sm border-earth-200 p-4 rounded-md text-earth-800">
                    {selectedConsult.chiefComplaint}
                  </div>
                </section>

                {/* Context */}
                <section className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-earth-200 p-4 rounded-md">
                    <h3 className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">{texts.healthContext}</h3>
                    <ul className="text-sm text-earth-700 space-y-1">
                      <li><span className="font-medium">{texts.age}:</span> {getFormatData(selectedConsult.healthContext).age || 'N/A'}</li>
                      <li><span className="font-medium">{texts.gender}:</span> {getFormatData(selectedConsult.healthContext).gender || 'N/A'}</li>
                      <li><span className="font-medium">{texts.allergies}:</span> {getFormatData(selectedConsult.healthContext).allergies || texts.none}</li>
                      <li><span className="font-medium">{texts.meds}:</span> {getFormatData(selectedConsult.healthContext).medications || texts.none}</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white border border-earth-200 p-4 rounded-md">
                    <h3 className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">{texts.lifestyle}</h3>
                    <ul className="text-sm text-earth-700 space-y-1">
                      <li><span className="font-medium">{texts.sleep}:</span> {getFormatData(selectedConsult.lifestyle).sleepPatterns || 'N/A'}</li>
                      <li><span className="font-medium">{texts.digestion}:</span> {getFormatData(selectedConsult.lifestyle).digestion || 'N/A'}</li>
                      <li><span className="font-medium">{texts.stress}:</span> {getFormatData(selectedConsult.lifestyle).stressLevels || 'N/A'}</li>
                    </ul>
                  </div>
                </section>

                {/* AI Remedy output */}
                <section className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-sage-600 uppercase tracking-wider flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> {texts.genLog}
                    </h3>
                    {selectedConsult.remedy && (
                      <button
                        onClick={() => handleSpeak(selectedConsult.id, selectedConsult.remedy || '')}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          speakingId === selectedConsult.id 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                            : 'bg-sage-50 text-sage-700 hover:bg-sage-100 border border-sage-200'
                        }`}
                      >
                        {speakingId === selectedConsult.id ? (
                          <><Square className="w-3 h-3 fill-current" /> {texts.stop}</>
                        ) : (
                          <><Volume2 className="w-3 h-3" /> {texts.readAloud}</>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap text-earth-800 bg-sage-50/30 p-6 rounded-md border border-sage-100 font-sans text-sm leading-relaxed">
                    {(selectedConsult.remedy || texts.noRemedy).replace(/\*\*/g, '')}
                  </div>
                </section>
              </div>

            </div>
          )}
        </div>
        
        </div>
      </div>
    </div>
  );
}

