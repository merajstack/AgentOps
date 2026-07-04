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

-- Drop previous insecure policies if they exist
DROP POLICY IF EXISTS "Allow public access to conversations for demo" ON public.conversations;
DROP POLICY IF EXISTS "Users can only see and manage their own conversations" ON public.conversations;

-- Create policy to allow authenticated users to see and manage ONLY their own conversations
CREATE POLICY "Users can only see and manage their own conversations" 
ON public.conversations 
FOR ALL 
TO authenticated
USING ( (auth.jwt() ->> 'email') = user_email );
