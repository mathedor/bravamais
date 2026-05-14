export type UserRole = "subscriber" | "establishment" | "commercial" | "admin" | "deliverer";

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
  deliverer: "/entregador",
};

// ============================================================
// Delivery
// ============================================================
export type DeliveryType = "pickup" | "delivery";
export type DeliveryStatus =
  | "awaiting_assignment"
  | "assigned"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "canceled";
export type DelivererStatus = "pending_review" | "approved" | "rejected" | "suspended" | "inactive";
export type VehicleType = "moto" | "carro" | "bike" | "a_pe" | "van";

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  cep: string;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  reference: string | null;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deliverer {
  id: string;
  user_id: string | null;
  full_name: string;
  cpf: string | null;
  rg: string | null;
  birth_date: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  photo_url: string | null;
  cnh_number: string | null;
  cnh_url: string | null;
  rg_url: string | null;
  cpf_url: string | null;
  vehicle: VehicleType;
  vehicle_model: string | null;
  vehicle_color: string | null;
  plate: string | null;
  city: string | null;
  state: string | null;
  status: DelivererStatus;
  is_public_freelancer: boolean;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  last_seen_at: string | null;
  rating_avg: number | null;
  rating_count: number;
  total_deliveries: number;
  rejection_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: string;
  establishment_id: string;
  max_km: number;
  fee_cents: number;
  free_above_cents: number | null;
  is_active: boolean;
  created_at: string;
}

export interface EstablishmentDeliverySettings {
  establishment_id: string;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  max_radius_km: number;
  default_prep_minutes: number;
  notify_template_whatsapp: string | null;
  updated_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  establishment_id: string;
  deliverer_id: string | null;
  status: DeliveryStatus;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  distance_km: number | null;
  fee_cents: number;
  confirmation_code: string;
  notes: string | null;
  route_index: number | null;
  assigned_at: string | null;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}
