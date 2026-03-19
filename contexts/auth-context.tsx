import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  email: string | null;
  role: 'admin' | 'user' | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        let nextRole: 'admin' | 'user' = 'user';

        if (snap.exists()) {
          const data = snap.data() as { role?: 'admin' | 'user' } | undefined;
          nextRole = data?.role ?? 'user';
        } else {
          // Missing doc (legacy users): create with default role "user"
          await setDoc(
            userRef,
            {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName ?? '',
              role: 'user',
              createdAt: serverTimestamp(),
            },
            { merge: true },
          );
        }

        setRole(nextRole);
      } catch (err) {
        console.error('[Auth] Firestore users/{uid}:', err);
        setRole('user');
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        email: user?.email ?? null,
        role,
        isAdmin: role === 'admin',
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
