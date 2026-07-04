CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  title text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see and manage their own conversations based on email
-- Note: Since authentication is currently client-side and we're storing user info in localStorage, 
-- and passing it around, we'll allow public access for now but in a real app, this should match auth.uid()
CREATE POLICY "Allow public access to conversations for demo" 
ON public.conversations 
FOR ALL 
USING (true);
