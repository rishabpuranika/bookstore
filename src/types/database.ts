export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'author' | 'admin';
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  price: number;
  cover_url: string | null;
  file_url: string | null;
  genre: string | null;
  published_date: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  book_id: string;
  purchase_date: string;
  amount_paid: number;
}
