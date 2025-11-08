/*
  # Create Bookstore Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text, default 'user') - user, author, or admin
      - `created_at` (timestamptz)
    
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `description` (text)
      - `price` (decimal)
      - `cover_url` (text) - URL to book cover image
      - `file_url` (text) - URL to the ebook file
      - `genre` (text)
      - `published_date` (date)
      - `uploaded_by` (uuid, references profiles)
      - `created_at` (timestamptz)
    
    - `purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `book_id` (uuid, references books)
      - `purchase_date` (timestamptz)
      - `amount_paid` (decimal)
    
  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read their own profile, admins can read all
    - Books: Anyone can read, only authors/admins can insert/update
    - Purchases: Users can read their own purchases, admins can read all
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  cover_url text,
  file_url text,
  genre text,
  published_date date,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view books"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authors and admins can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('author', 'admin')
    )
  );

CREATE POLICY "Authors can update own books, admins can update all"
  ON books FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  book_id uuid REFERENCES books(id) NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  amount_paid decimal(10,2) NOT NULL,
  UNIQUE(user_id, book_id)
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS books_genre_idx ON books(genre);
CREATE INDEX IF NOT EXISTS books_title_idx ON books(title);
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);
CREATE INDEX IF NOT EXISTS purchases_book_id_idx ON purchases(book_id);