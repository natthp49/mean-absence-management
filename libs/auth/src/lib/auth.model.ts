export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  MEMBER = 'Member',
}

export interface Profile {
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface TokensWithProfile {
  accessToken: string;
  refreshToken: string;
  user: Profile;
}

export interface ProfileForm {
  name: string;
  password: string;
  avatar: File | null;
}
