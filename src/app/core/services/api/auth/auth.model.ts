export type UserRole = 'CLIENT' | 'SUPPLIER' | 'TRANSPORTER' | 'ADMIN' | 'COLLABORATOR';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface User {
  public_id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string | null;
  primary_role: UserRole;
  roles: UserRole[];
  account_status: AccountStatus;
  is_active: boolean;
  is_validated: boolean;
  is_verified: boolean;
  is_hybrid: boolean;
  created_at: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  roles: UserRole[];
}

export interface VerifyOtpDto {
  otp_code: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RoleRequestDto {
  role: UserRole;
  note?: string;
}

export interface UserRoleEntry {
  id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  granted_at: string;
  note: string | null;
}

export interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface SupplierProfileDto {
  company_name: string;
  ifu_number: string;
  rccm_number: string;
  depot_address: string;
  depot_city: string;
}

export interface TransporterProfileDto {
  company_name: string;
  license_number: string;
  operating_zones: string[];
  max_load_tons: number;
  base_city: string;
}

export interface TruckDto {
  license_plate: string;
  brand: string;
  model: string;
  year: string;
  max_weight: number;
}
