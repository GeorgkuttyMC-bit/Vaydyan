import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Menu, X } from 'lucide-react';

export default function RootLayout() {
  const { userData, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-earth-50">
      <header className="border-b border-earth-200 bg-earth-50 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="bg-sage-600 p-1.5 rounded-lg shadow-sm">
                 <Leaf className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-bold text-earth-800 tracking-tight">Vaydyan</span>
                <span className="font-serif text-lg italic text-sage-600 font-medium">by George</span>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-8 items-center">
              <Link to="/" className="text-earth-600 hover:text-sage-600 font-medium transition-colors">Home</Link>
              <Link to="/#about" className="text-earth-600 hover:text-sage-600 font-medium transition-colors">About Ayurveda</Link>
              {userData ? (
                <>
                  <Link to={userData.role === 'doctor' ? '/admin' : '/my-health'} className="text-earth-600 hover:text-sage-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <button 
                    onClick={logout}
                    className="text-earth-600 hover:text-terra-500 font-medium transition-colors"
                  >
                    Logout ({userData.displayName})
                  </button>
                  <Link to="/consult" className="px-5 py-2.5 bg-sage-600 text-white hover:bg-sage-800 rounded-md font-medium transition-colors">
                    Consult Now
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-earth-600 hover:text-sage-600 font-medium transition-colors">My Profile</Link>
                  <Link to="/consult" className="px-5 py-2.5 bg-sage-600 text-white hover:bg-sage-800 rounded-md font-medium transition-colors">
                    Consult Now
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
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-earth-800 font-medium py-2">Home</Link>
            <Link to="/#about" onClick={() => setMobileMenuOpen(false)} className="text-earth-800 font-medium py-2">About Ayurveda</Link>
            {userData ? (
              <>
                <Link to={userData.role === 'doctor' ? '/admin' : '/my-health'} onClick={() => setMobileMenuOpen(false)} className="text-earth-800 font-medium py-2">
                  Dashboard
                </Link>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-left text-earth-800 font-medium py-2"
                >
                  Logout ({userData.displayName})
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-earth-800 font-medium py-2">My Profile</Link>
            )}
            <Link to="/consult" onClick={() => setMobileMenuOpen(false)} className="mt-2 text-center w-full px-5 py-3 bg-sage-600 text-white rounded-md font-medium">
              Consult Now
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
