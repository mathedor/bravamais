export type UserRole = "subscriber" | "establishment" | "commercial" | "admin";

export type SubscriptionTier = "basico" | "premium" | "vip";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "canceled"
  | "paused";

export type PromotionType =
  | "cupom_desconto"
  | "vale_presente"
  | "vale_compras"
  | "clube_fidelidade"
  | "cashback";

export type OrderStatus =
  | "cart"
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "completed"
  | "canceled"
  | "refunded";

export type PaymentMethod = "pix" | "credit_card";

export type NotificationType =
  | "subscription"
  | "order"
  | "message"
  | "loyalty_reward"
  | "establishment_news"
  | "system";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Establishment {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  photos: string[];
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  is_verified: boolean;
  average_rating: number | null;
  total_reviews: number;
  total_visits: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  monthly_cents: number;
  yearly_cents: number | null;
  features: { bullets?: string[] } & Record<string, unknown>;
  display_order: number;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  efi_subscription_id: string | null;
  efi_customer_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QrCard {
  id: string;
  user_id: string;
  code: string;
  issued_at: string;
  rotated_at: string | null;
}

export const ROLE_HOME: Record<UserRole, string> = {
  subscriber: "/app",
  establishment: "/loja",
  commercial: "/comercial",
  admin: "/admin",
};
