-- Realtime para fotos procesadas (F3) y mensajes (F5)
alter publication supabase_realtime add table public.photos;
alter publication supabase_realtime add table public.gallery_messages;
