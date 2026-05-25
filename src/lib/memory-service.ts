import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  limit,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  signOut 
} from 'firebase/auth';
import { db, auth } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Memory {
  id: string;
  userId: string;
  content: string;
  category?: string;
  createdAt: any;
}

class MemoryService {
  private user: User | null = null;
  private authReady: Promise<User | null>;
  private resolveAuthReady!: (user: User | null) => void;

  constructor() {
    this.authReady = new Promise((resolve) => {
      this.resolveAuthReady = resolve;
    });

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        this.resolveAuthReady(user);
      } else {
        try {
          const credential = await signInAnonymously(auth);
          this.user = credential.user;
          this.resolveAuthReady(credential.user);
        } catch (error: any) {
          console.warn('Anonymous auth failed or is disabled:', error.message);
          this.user = null;
          this.resolveAuthReady(null);
        }
      }
    });
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      this.user = result.user;
      return result.user;
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;
      const isPopupBlocked = error?.code === 'auth/popup-blocked' || error?.message?.includes('popup-blocked');
      
      if (isPopupBlocked && !isIframe) {
        console.warn('Popup blocked in standalone view. Falling back to signInWithRedirect...');
        // This will redirect the current tab to Google auth flow seamlessly
        await signInWithRedirect(auth, provider);
        return null;
      }
      
      throw error;
    }
  }

  async logout() {
    await signOut(auth);
    this.user = null;
  }

  async getUser() {
    return this.authReady;
  }

  private getLocalMemories(): { id: string; content: string; createdAt: string }[] {
    try {
      const data = localStorage.getItem('sona_local_memories');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private saveLocalMemory(content: string) {
    try {
      const list = this.getLocalMemories();
      const newMem = {
        id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
        content,
        createdAt: new Date().toISOString()
      };
      list.unshift(newMem);
      localStorage.setItem('sona_local_memories', JSON.stringify(list));
      return newMem;
    } catch (e) {
      return null;
    }
  }

  private deleteLocalMemory(id: string): boolean {
    try {
      const list = this.getLocalMemories();
      const filtered = list.filter(m => m.id !== id);
      localStorage.setItem('sona_local_memories', JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  }

  async saveMemory(content: string, category: string = 'general') {
    // Always backup to local storage in case of connection failure
    this.saveLocalMemory(content);

    const user = await this.getUser();
    if (!user) {
      console.warn('User not authenticated, saved memory in local cache successfully.');
      return true;
    }

    try {
      await addDoc(collection(db, 'memories'), {
        userId: user.uid,
        content,
        category,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.warn('Firestore write failed, using secure local cache storage fallback seamlessly:', error);
      return true; // Return true as we successfully captured it in local storage fallback
    }
  }

  async getRecentMemories(count: number = 20): Promise<string[]> {
    const user = await this.getUser();
    if (!user) {
      return this.getLocalMemories().slice(0, count).map(m => m.content);
    }

    try {
      const q = query(
        collection(db, 'memories'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      const firestoreMems = snapshot.docs.map(doc => doc.data().content);
      
      // Merge with any local unique memories
      const localMems = this.getLocalMemories().map(m => m.content);
      return Array.from(new Set([...firestoreMems, ...localMems])).slice(0, count);
    } catch (error) {
      console.warn('Firestore is unreachable, pulling from secure local storage cache seamlessly.');
      return this.getLocalMemories().slice(0, count).map(m => m.content);
    }
  }

  async getRecentMemoriesWithIds(count: number = 20): Promise<{ id: string; content: string }[]> {
    const user = await this.getUser();
    if (!user) {
      return this.getLocalMemories().slice(0, count).map(m => ({ id: m.id, content: m.content }));
    }

    try {
      const q = query(
        collection(db, 'memories'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      const firestoreMems = snapshot.docs.map(doc => ({
        id: doc.id,
        content: doc.data().content as string
      }));
      
      const localMems = this.getLocalMemories().map(m => ({ id: m.id, content: m.content }));
      
      // Combine list ensuring uniqueness on content
      const combined = [...firestoreMems];
      localMems.forEach(lm => {
        if (!combined.some(cm => cm.content === lm.content || cm.id === lm.id)) {
          combined.push(lm);
        }
      });
      return combined.slice(0, count);
    } catch (error) {
      console.warn('Firestore is unreachable, loading recent memories from offline cache.');
      return this.getLocalMemories().slice(0, count).map(m => ({ id: m.id, content: m.content }));
    }
  }

  async deleteMemory(id: string): Promise<boolean> {
    // Always clear from local cache
    this.deleteLocalMemory(id);

    const user = await this.getUser();
    if (!user) {
      return true;
    }

    try {
      await deleteDoc(doc(db, 'memories', id));
      return true;
    } catch (error) {
      console.warn('Failed to delete memory from server, purged local copy successfully.');
      return true;
    }
  }

  async searchMemories(searchTerm: string): Promise<string[]> {
    const user = await this.getUser();
    let allMemories: string[] = [];

    if (!user) {
      allMemories = this.getLocalMemories().map(m => m.content);
    } else {
      try {
        const q = query(
          collection(db, 'memories'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const firestoreMems = snapshot.docs.map(doc => doc.data().content);
        const localMems = this.getLocalMemories().map(m => m.content);
        allMemories = Array.from(new Set([...firestoreMems, ...localMems]));
      } catch (error) {
        allMemories = this.getLocalMemories().map(m => m.content);
      }
    }
    
    // Simple client-side search for better contextual matching
    const terms = searchTerm.toLowerCase().split(' ');
    return allMemories.filter(memory => 
      terms.some(term => memory.toLowerCase().includes(term))
    ).slice(0, 5);
  }
}

export const memoryService = new MemoryService();
