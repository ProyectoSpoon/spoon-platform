// ========================================
// SPOON PLATFORM - Tipos Base
// ========================================

export interface BaseTenant {
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Restaurant extends BaseTenant {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  cover_url?: string;
  latitude: number;
  longitude: number;
  opening_hours: OpeningHours;
  table_count: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface OpeningHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  open: string;  // "08:00"
  close: string; // "22:00"
  closed: boolean;
}

export interface Product extends BaseTenant {
  id: string;
  name: string;
  description?: string;
  category: ProductCategory;
  image_url?: string;
  is_universal: boolean; // Del catálogo universal
}

export type ProductCategory = 
  | 'entradas' 
  | 'principios' 
  | 'proteinas' 
  | 'acompañamientos' 
  | 'bebidas';

export interface MenuCombination extends BaseTenant {
  id: string;
  restaurant_id: string;
  combination_items: string[]; // Array de product IDs
  price: number;
  available_date: string;
  searchable_text: string;
  tags: string[];
  is_available: boolean;
  sold_out: boolean;
}

export interface User extends BaseTenant {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

// Mesa types
export type { Mesa } from './mesas';
