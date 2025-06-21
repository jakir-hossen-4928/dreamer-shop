
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase.config';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  signup: (name: string, email: string, password: string, number: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');
    let userDocUnsubscribe: (() => void) | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed:', firebaseUser?.uid);
      setFirebaseUser(firebaseUser);
      
      // Clean up previous user document listener
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }
      
      if (firebaseUser) {
        try {
          // Get the user's ID token
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          
          // Get user data from Firestore with real-time updates
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // Set up real-time listener ONLY for the current authenticated user's document
          userDocUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('[AuthContext] User document data:', userData);
              
              // Normalize data to consistent field names (capitalized)
              const mappedUser: User = {
                ID: firebaseUser.uid,
                Name: userData.Name || userData.name || firebaseUser.displayName || '',
                Email: userData.Email || userData.email || firebaseUser.email || '',
                Number: userData.Number || userData.number || '',
                Status: userData.Status || userData.status || 'Non-Verified',
                Role: userData.Role || userData.role || 'Moderator'
              };
              
              console.log('[AuthContext] Mapped user data for current user:', mappedUser);
              setUser(mappedUser);
            } else {
              console.log('[AuthContext] User document does not exist for current user');
              setUser(null);
            }
          }, (error) => {
            console.error('[AuthContext] Error listening to user document:', error);
            setUser(null);
          });

        } catch (error) {
          console.error('[AuthContext] Error getting user data:', error);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[AuthContext] Login attempt for:', email);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is verified
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userStatus = userData.Status || userData.status || 'Non-Verified';
        console.log('[AuthContext] User status during login:', userStatus);
        
        // Check for both "Verified" and "verified" (case insensitive)
        if (userStatus.toLowerCase() !== 'verified') {
          await signOut(auth);
          throw new Error('VERIFICATION_PENDING');
        }
      } else {
        await signOut(auth);
        throw new Error('User data not found. Please contact support.');
      }
      
      console.log('[AuthContext] Login successful:', userCredential.user.uid);
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      if (error.message === 'VERIFICATION_PENDING') {
        throw error;
      }
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Logout initiated');
    try {
      await signOut(auth);
      console.log('[AuthContext] Logout successful');
    } catch (error: any) {
      console.error('[AuthContext] Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  const signup = async (name: string, email: string, password: string, number: string) => {
    console.log('[AuthContext] Signup attempt for:', email);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // Create user document in Firestore with consistent field names
      const userData = {
        Name: name,
        Email: email,
        Number: number,
        Role: 'Moderator', // Default role
        Status: 'Non-Verified', // Requires admin verification
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userId), userData);
      console.log('[AuthContext] Signup successful and user document created');
      
      // Sign out the user immediately after signup since they need verification
      await signOut(auth);
    } catch (error: any) {
      console.error('[AuthContext] Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    console.log('[AuthContext] Password reset request for:', email);
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('[AuthContext] Password reset email sent');
    } catch (error: any) {
      console.error('[AuthContext] Password reset error:', error);
      throw new Error(error.message || 'Password reset request failed');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const userDocRef = doc(db, 'users', user.ID);
      // Use consistent field names when updating
      const updateData: any = {};
      if (data.Name !== undefined) updateData.Name = data.Name;
      if (data.Email !== undefined) updateData.Email = data.Email;
      if (data.Number !== undefined) updateData.Number = data.Number;
      if (data.Role !== undefined) updateData.Role = data.Role;
      if (data.Status !== undefined) updateData.Status = data.Status;
      
      updateData.updatedAt = new Date().toISOString();
      
      await updateDoc(userDocRef, updateData);
      console.log('[AuthContext] Profile updated successfully');
    } catch (error: any) {
      console.error('[AuthContext] Profile update error:', error);
      throw new Error(error.message || 'Profile update failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      token,
      login,
      logout,
      loading,
      signup,
      requestPasswordReset,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
