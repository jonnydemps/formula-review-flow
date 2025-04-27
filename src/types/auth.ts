
export type UserRole = 'customer' | 'specialist' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  signOut: () => void;
}
