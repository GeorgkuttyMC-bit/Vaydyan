import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserData {
  displayName: string;
  role: 'patient' | 'doctor';
}

interface AuthContextType {
  userData: UserData | null;
  loading: boolean;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for an existing name
    const storedName = localStorage.getItem('vaydyan_user_name');
    if (storedName) {
      setUserData({
        displayName: storedName,
        role: storedName.toLowerCase() === 'george' ? 'doctor' : 'patient'
      });
    }
    setLoading(false);
  }, []);

  const login = (name: string) => {
    localStorage.setItem('vaydyan_user_name', name);
    setUserData({
      displayName: name,
      role: name.toLowerCase() === 'george' ? 'doctor' : 'patient'
    });
  };

  const logout = () => {
    localStorage.removeItem('vaydyan_user_name');
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ userData, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
