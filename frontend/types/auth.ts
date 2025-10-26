export interface User {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  profile_picture?: string;
  oauth_provider?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

export interface GoogleAuthRequest {
  credential: string; // Google ID token
}
