import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, HeartPulse, UserCheck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const { language } = useLanguage();
  const isDe = language === 'de';

  const texts = {
    heroBadge: isDe ? '100% natürliche ayurvedische Pflege' : '100% Natural Ayurvedic Care',
    heroTitleLine1: isDe ? 'Uralte Heilung für' : 'Ancient Healing for',
    heroTitleLine2: isDe ? 'das moderne Leben.' : 'Modern Life.',
    heroDesc: isDe ? 'Stellen Sie das natürliche Gleichgewicht Ihres Körpers wieder her. Personalisierte, ganzheitliche ayurvedische Heilmittel, die speziell auf Ihr einzigartiges Dosha abgestimmt sind.' : 'Reconnect with your body\'s natural balance. Personalized, holistic Ayurvedic remedies crafted specifically for your unique dosha.',
    heroButton: isDe ? 'Finden Sie Ihr Heilmittel' : 'Find Your Remedy Now',
    heroBadge1: isDe ? 'Sicher & Vertraulich' : 'Secure & Confidential',
    heroBadge2: isDe ? 'Ganzheitliches Wohlbefinden' : 'Holistic Wellness',
    howTitle: isDe ? 'Wie es funktioniert' : 'How It Works',
    howDesc: isDe ? 'Drei einfache Schritte, um Ihre Reise zu optimaler Gesundheit und Ausgeglichenheit zu beginnen.' : 'Three simple steps to begin your journey toward optimal health and balance.',
    step1Title: isDe ? 'Teilen Sie uns Ihre Symptome mit' : 'Tell Us Your Symptoms',
    step1Desc: isDe ? 'Füllen Sie unser sicheres, umfassendes Konsultationsformular aus und beschreiben Sie Ihre aktuellen gesundheitlichen Bedenken und Ihren Lebensstil.' : 'Complete our secure, comprehensive consultation form detailing your current health concerns and lifestyle.',
    step2Title: isDe ? 'Vaydyan analysiert' : 'Vaydyan Analyzes',
    step2Desc: isDe ? 'Unser intelligentes Ayurveda-KI-System analysiert Ihr Dosha-Ungleichgewicht und Ihre Krankengeschichte sorgfältig.' : 'Our intelligent Ayurvedic AI system carefully analyzes your dosha imbalance and health history.',
    step3Title: isDe ? 'Erhalten Sie ein natürliches Heilmittel' : 'Receive Natural Remedy',
    step3Desc: isDe ? 'Erhalten Sie ein individuelles Protokoll mit spezifischen Kräutern, Ernährungsumstellungen und Yoga-Empfehlungen.' : 'Get a customized protocol including specific herbs, dietary adjustments, and yoga recommendations.',
    aboutTitle: isDe ? 'Treffe George' : 'Meet George',
    aboutSubtitle: isDe ? 'Anwendungsentwickler & Visionär' : 'Application Developer & Visionary',
    aboutP1: isDe ? 'George ist der Entwickler und Visionär hinter der Vaydyan-Plattform. Durch die nahtlose Verbindung der alten Diagnoseprinzipien des Ayurveda mit den innovativen Möglichkeiten der KI hat er einen zugänglichen digitalen Arzt entwickelt, der die Lücke zwischen östlicher Weisheit und moderner Technologie schließt.' : 'George is the developer and visionary behind the Vaydyan platform. By seamlessly bringing together the ancient diagnostic principles of Ayurveda and the cutting-edge capabilities of AI, he engineered an accessible digital doctor that bridges the gap between Eastern wisdom and modern technology.',
    aboutQuote: isDe ? '"Indem wir die ganzheitliche Weisheit des Ayurveda durch intelligente Software demokratisieren, befähigen wir den Einzelnen, sein Wohlbefinden auf natürliche Weise selbst in die Hand zu nehmen."' : '"By democratizing the holistic wisdom of Ayurveda through intelligent software, we empower individuals to take control of their wellness naturally."'
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-earth-100 py-24 sm:py-32">
        <div className="absolute inset-0 opacity-10 pattern-dots text-earth-800" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-sm font-medium mb-8">
            <Leaf className="w-4 h-4" />
            {texts.heroBadge}
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-earth-800 mb-6 drop-shadow-sm">
            {texts.heroTitleLine1} <br className="hidden md:block"/> {texts.heroTitleLine2}
          </h1>
          <p className="text-xl md:text-2xl text-earth-600 max-w-3xl mx-auto mb-10 font-light">
            {texts.heroDesc}
          </p>
          <Link to="/consult" className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white px-8 py-4 rounded-md text-lg font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
            {texts.heroButton} <ArrowRight className="w-5 h-5" />
          </Link>
          
          <div className="mt-12 flex justify-center gap-8 text-earth-500">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-sage-500"/> {texts.heroBadge1}</div>
            <div className="flex items-center gap-2"><HeartPulse className="w-5 h-5 text-terra-500"/> {texts.heroBadge2}</div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-earth-800 mb-4">{texts.howTitle}</h2>
            <p className="text-earth-500 max-w-2xl mx-auto">{texts.howDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-earth-200"></div>
            
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-earth-100 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                <span className="text-3xl font-serif text-sage-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-earth-800 mb-3">{texts.step1Title}</h3>
              <p className="text-earth-600">{texts.step1Desc}</p>
            </div>
            
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-earth-100 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                <span className="text-3xl font-serif text-sage-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-earth-800 mb-3">{texts.step2Title}</h3>
              <p className="text-earth-600">{texts.step2Desc}</p>
            </div>
            
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-earth-100 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                <span className="text-3xl font-serif text-sage-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-earth-800 mb-3">{texts.step3Title}</h3>
              <p className="text-earth-600">{texts.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About George */}
      <section id="about" className="py-24 bg-sage-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-2/5 bg-earth-200 min-h-[300px] flex items-center justify-center relative">
               {/* Image placeholder */}
               <div className="absolute inset-0 bg-earth-300 overflow-hidden flex items-center justify-center">
                 <UserCheck className="w-32 h-32 text-earth-400 opacity-50" />
                 <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" alt="Mortar and pestle with herbs" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
               </div>
            </div>
            <div className="md:w-3/5 p-10 md:p-14 flex flex-col justify-center">
              <h2 className="text-3xl font-serif text-earth-800 mb-4">{texts.aboutTitle}</h2>
              <h3 className="text-sage-600 text-lg font-medium mb-6">{texts.aboutSubtitle}</h3>
              <p className="text-earth-600 mb-6 leading-relaxed">
                {texts.aboutP1}
              </p>
              <p className="text-earth-600 leading-relaxed font-serif italic border-l-4 border-sage-200 pl-4">
                {texts.aboutQuote}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
