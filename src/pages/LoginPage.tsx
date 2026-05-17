import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const { userData, login, loading } = useAuth();
  const [nameInput, setNameInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && userData) {
      const from = location.state?.from?.pathname || (userData.role === 'doctor' ? '/admin' : '/my-health');
      navigate(from, { replace: true });
    }
  }, [userData, loading, navigate, location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      login(nameInput.trim());
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-earth-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-earth-100 text-center">
        <div className="mx-auto w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mb-6">
          <Leaf className="w-8 h-8 text-sage-600" />
        </div>
        <h2 className="text-3xl font-serif text-earth-800 mb-2">Welcome</h2>
        <p className="text-earth-500 mb-8">Please enter your name to access your consultations and Ayurvedic remedies.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter your full name"
            className="w-full border border-earth-300 rounded-md p-3 focus:ring-sage-500 focus:border-sage-500"
          />
          <button 
            type="submit"
            className="w-full bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            Continue
          </button>
        </form>
        
        <p className="mt-8 text-xs text-earth-400">
          By continuing, you agree to our Terms of Service and Medical Disclaimer.
        </p>
      </div>
    </div>
  );
}
