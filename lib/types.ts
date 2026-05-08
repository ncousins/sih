export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_path: string;
  cover_image_path: string | null;
  is_paid: boolean;
  is_member_only: boolean;
  price: number | null;
  is_published: boolean;
  created_at: string;
}

export interface Member {
  id: string;
  email: string;
  organisation: string | null;
  tier: string;
}

export interface Download {
  id: string;
  user_id: string;
  document_id: string;
  payment_status: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  document_id: string;
  amount: number;
  currency: string;
  paystack_ref: string | null;
  status: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_path: string | null;
  is_published: boolean;
  created_at: string;
}
