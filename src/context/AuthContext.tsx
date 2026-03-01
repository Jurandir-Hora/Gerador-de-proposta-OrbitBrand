import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_EMAILS = [
  'atomoseletrotecnica@gmail.com',
  'thifanygomesorbilem@gmail.com'
];

const mapFirebaseUser = (fbUser: FirebaseUser): AuthUser => {
  const email = fbUser.email ?? '';
  const fallbackName = email ? email.split('@')[0] : 'Usuário Orbit';

  // Lógica de papéis: Verifica se o e-mail está na lista de masters (sem espaços e minúsculo)
  const role = MASTER_EMAILS.includes(email.trim().toLowerCase()) ? 'master' : 'collaborator';

  return {
    id: fbUser.uid,
    name: fbUser.displayName || fallbackName,
    email,
    role,
    avatarUrl: fbUser.photoURL || undefined,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Busca perfil estendido no Firestore
        const userRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userRef);

        const baseUser = mapFirebaseUser(fbUser);

        if (userSnap.exists()) {
          const firestoreData = userSnap.data();
          setUser({
            ...baseUser,
            name: firestoreData.name || baseUser.name,
            avatarUrl: firestoreData.avatarUrl || baseUser.avatarUrl,
            role: firestoreData.role || baseUser.role
          });
        } else {
          // Cria registro inicial no Firestore se não existir
          const initialData = {
            id: fbUser.uid,
            name: baseUser.name,
            email: baseUser.email,
            role: baseUser.role,
            avatarUrl: baseUser.avatarUrl || '',
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, initialData);
          setUser(baseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const register = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (cred.user) {
      const trimmedName = name.trim();
      const baseUser = mapFirebaseUser(cred.user);

      // Salva no Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        id: cred.user.uid,
        name: trimmedName || baseUser.name,
        email: baseUser.email,
        role: baseUser.role,
        avatarUrl: '',
        createdAt: new Date().toISOString()
      });

      if (trimmedName) {
        await updateProfile(cred.user, { displayName: trimmedName });
      }

      setUser({
        ...baseUser,
        name: trimmedName || baseUser.name
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUser = async (data: { name?: string; avatarUrl?: string }) => {
    if (auth.currentUser) {
      // Atualiza Firebase Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: data.name || auth.currentUser.displayName,
        photoURL: data.avatarUrl || auth.currentUser.photoURL
      });

      // Atualiza Firestore Profile
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ...(data.name ? { name: data.name } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {})
      });

      // Atualiza estado local
      setUser(prev => prev ? {
        ...prev,
        name: data.name || prev.name,
        avatarUrl: data.avatarUrl || prev.avatarUrl
      } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
};
