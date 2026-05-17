import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Menu, X, Globe } from 'lucide-react';

export default function RootLayout() {
  const { userData, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDe = language === 'de';

  const texts = {
    home: isDe ? 'Startseite' : 'Home',
    about: isDe ? 'Über Ayurveda' : 'About Ayurveda',
    dashboard: isDe ? 'Verwaltungs-Dashboard' : 'Dashboard',
    adminDashboard: isDe ? 'Admin Dashboard' : 'Admin Dashboard',
    logout: isDe ? 'Abmelden' : 'Logout',
    profile: isDe ? 'Mein Profil' : 'My Profile',
    consult: isDe ? 'Jetzt konsultieren' : 'Consult Now',
  };

  return (
    <div className="min-h-screen flex flex-col bg-earth-50">
      <header className="border-b border-earth-200 bg-earth-50 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 mr-4" onClick={() => setMobileMenuOpen(false)}>
                <div className="bg-sage-600 p-1.5 rounded-lg shadow-sm">
                   <Leaf className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-2xl font-bold text-earth-800 tracking-tight">Vaydyan</span>
                  <span className="font-serif text-lg italic text-sage-600 font-medium hidden sm:inline">by George</span>
                </div>
              </Link>

              {/* Language Switch Button for Mobile */}
              <button 
                onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                className="md:hidden flex items-center justify-center p-1.5 text-earth-600 hover:text-sage-600 transition-colors rounded-md bg-earth-50 border border-earth-200"
                aria-label="Toggle language"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-earth-700">
                  <Globe className="w-4 h-4 text-sage-600" />
                  {language === 'en' ? 'DE' : 'EN'}
                </div>
              </button>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-6 items-center">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                className="flex items-center gap-1.5 text-earth-600 hover:text-sage-600 font-medium transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? 'EN / DE' : 'DE / EN'}
              </button>
              
              <Link to="/" className="text-earth-600 hover:text-sage-600 font-medium transition-colors">{texts.home}</Link>
              <Link to="/#about" className="text-earth-600 hover:text-sage-600 font-medium transition-colors">{texts.about}</Link>
              {userData ? (
                <>
                  <Link to={userData.role === 'doctor' ? '/admin' : '/my-health'} className="text-earth-600 hover:text-sage-600 font-medium transition-colors">
                    {userData.role === 'doctor' ? texts.adminDashboard : texts.dashboard}
                  </Link>
                  <button 
                    onClick={logout}
                    className="text-earth-600 hover:text-terra-500 font-medium transition-colors"
                  >
                    {texts.logout} ({userData.displayName})
                  </button>
                  <Link to="/consult" className="px-5 py-2.5 bg-sage-600 text-white hover:bg-sage-800 rounded-md font-medium transition-colors">
                    {texts.consult}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-earth-600 hover:text-sage-600 font-medium transition-colors">{texts.profile}</Link>
                  <Link to="/consult" className="px-5 py-2.5 bg-sage-600 text-white hover:bg-sage-800 rounded-md font-medium transition-colors">
                    {texts.consult}
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-earth-800 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-earth-200 shadow-sm py-4 px-4 flex flex-col gap-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-earth-800 font-medium py-2">{texts.home}</Link>
            <Link to="/#about" onClick={() => setMobileMenuOpen(false)} className="text-earth-800 font-medium py-2">{texts.about}</Link>
            {userData ? (
              <>
                <Link to={userData.role === 'doctor' ? '/admin' : '/my-health'} onClick={() => setMobileMenuOpen(false)} className="text-earth-800 font-medium py-2">
                  {userData.role === 'doctor' ? texts.adminDashboard : texts.dashboard}
                </Link>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-left text-earth-800 font-medium py-2"
                >
                  {texts.logout} ({userData.displayName})
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-earth-800 font-medium py-2">{texts.profile}</Link>
            )}
            <Link to="/consult" onClick={() => setMobileMenuOpen(false)} className="mt-2 text-center w-full px-5 py-3 bg-sage-600 text-white rounded-md font-medium">
              {texts.consult}
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
          <Outlet />
      </main>

      <footer className="bg-earth-900 border-t border-earth-800 mt-auto text-earth-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-sage-600 p-1.5 rounded-lg shadow-sm">
                   <Leaf className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-2xl font-bold text-earth-50 tracking-tight">Vaydyan</span>
                  <span className="font-serif text-lg italic text-sage-400 font-medium">by George</span>
                </div>
              </div>
              <p className="text-earth-300 text-sm max-w-sm mb-6">
                Ancient healing for modern life. Holistic Ayurveda treatments and remedies crafted by Vaydyan AI and George.
              </p>
            </div>
            <div>
              <h3 className="font-serif font-semibold text-earth-50 mb-4 px-2 tracking-wide">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-earth-300 hover:text-sage-200 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-earth-300 hover:text-sage-200 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-earth-300 hover:text-sage-200 transition-colors">Medical Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif font-semibold text-earth-50 mb-4 px-2 tracking-wide">Connect</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-earth-300 hover:text-sage-200 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-sm text-earth-300 hover:text-sage-200 transition-colors">FAQs</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-earth-800 mt-12 pt-8 text-center text-sm text-earth-400">
            <p className="mb-2"><strong>Medical Disclaimer:</strong> The information and remedies provided on this platform are for educational and holistic wellness purposes only. They are not intended to diagnose, treat, cure, or prevent any severe medical condition and should not replace emergency medical care or consultation with a licensed physician.</p>
            <p>&copy; {new Date().getFullYear()} Vaydyan by George. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
