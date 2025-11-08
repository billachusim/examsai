-- Fix function search path security issue
drop function if exists generate_faculty_id();

create or replace function generate_faculty_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id text;
  id_exists boolean;
begin
  loop
    -- Generate random 5-digit number
    new_id := 'FAC-' || lpad(floor(random() * 100000)::text, 5, '0');
    
    -- Check if it exists
    select exists(select 1 from public.profiles where faculty_id = new_id) into id_exists;
    
    -- Exit loop if unique
    exit when not id_exists;
  end loop;
  
  return new_id;
end;
$$;