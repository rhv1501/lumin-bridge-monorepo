export type UserRole = 'factory' | 'buyer' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  company_name?: string;
  wechat_id?: string;
  mobile_number?: string;
  whatsapp_number?: string;
  photo?: string;
  must_change_password?: boolean;
  profile_views?: number;
}

export type ApprovalStatus =
  | 'pending_verification'
  | 'pending'
  | 'approved'
  | 'disapproved';

export interface AccountRequest {
  id: number;
  email: string;
  role: 'buyer' | 'factory';
  company_name?: string | null;
  wechat_id?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  email_verified: boolean;
  approval_status: ApprovalStatus;
  approval_note?: string | null;
  must_change_password: boolean;
  created_at: string;
  approved_at?: string | null;
  disapproved_at?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  specifications?: string;
  photo?: string;
  factory_price_cny: number;
  buyer_price_inr: number | null;
  status: 'draft' | 'published';
  factory_id: number;
  category?: string;
  moq?: number;
  average_rating?: number;
  review_count?: number;
  created_at?: string;
  factory_company?: string;
  factory_email?: string;
  factory_wechat?: string;
  factory_mobile?: string;
}

export interface CustomOrder {
  id: number;
  buyer_id: number;
  photo: string;
  requirements: string;
  status: string;
  created_at: string;
  buyer_company?: string;
  buyer_email?: string;
}

export interface CustomOrderProposal {
  id: number;
  custom_order_id: number;
  factory_id: number;
  photo: string;
  description: string;
  price_cny: number;
  price_inr?: number;
  status: 'pending' | 'published' | 'accepted' | 'rejected';
  created_at: string;
  factory_company?: string;
  factory_email?: string;
  factory_mobile?: string;
  factory_wechat?: string;
  production_time?: number;
  notes?: string;
}

export interface Order {
  id: number;
  product_id: number;
  buyer_id: number;
  factory_id: number;
  quantity: number;
  total_price?: number;
  status: string;
  created_at: string;
  product_name?: string;
  product_photo?: string;
  buyer_email?: string;
  buyer_company?: string;
  buyer_whatsapp?: string;
  rejection_reason?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type?: string;
  related_id?: number;
  is_read: number;
  created_at: string;
}

export interface Settings {
  exchange_rate: string;
  admin_markup: string;
}

export interface Review {
  id: number;
  order_id: number;
  product_id: number;
  factory_id: number;
  buyer_id: number;
  rating: number;
  comment: string;
  created_at: string;
  product_name?: string;
  buyer_company?: string;
  factory_company?: string;
}

export interface Message {
  id: number;
  custom_order_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}
