import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { generateId } from '../../../shared/utils/helpers';

const AuthContext = createContext(null);

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('evo_users') || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem('evo_users', JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('evo_session') || 'null');
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem('evo_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('evo_session');
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = getSession();
    if (session?.isAuthenticated && session?.currentUser) {
      setUser(session.currentUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!found) {
      return { success: false, error: 'Invalid email or password' };
    }

    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    setIsAuthenticated(true);
    saveSession({ isAuthenticated: true, currentUser: safeUser });
    return { success: true };
  }, []);

  const signup = useCallback((name, email, password) => {
    const users = getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      id: generateId(),
      name,
      email: email.toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);

    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    setIsAuthenticated(true);
    saveSession({ isAuthenticated: true, currentUser: safeUser });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    saveSession(null);
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
