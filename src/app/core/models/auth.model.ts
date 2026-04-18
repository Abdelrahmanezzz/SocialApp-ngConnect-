import { User } from './user.model';

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SignupRequest {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: Gender;
  password: string;
  rePassword: string;
}

export interface SigninRequest {
  emailOrUsername: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string; // sent as "password" to API
  newPassword: string;
  rePassword: string;
}