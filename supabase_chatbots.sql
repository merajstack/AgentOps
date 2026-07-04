-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  chatbot_name text NOT NULL,
  training_data text NOT NULL,
  api_key text UNIQUE NOT NULL,
  api_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to chatbots for demo"
ON public.chatbots
FOR ALL
USING (true);

CREATE INDEX IF NOT EXISTS idx_chatbots_api_key ON public.chatbots(api_key);
CREATE INDEX IF NOT EXISTS idx_chatbots_user_email ON public.chatbots(user_email);
