-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_published boolean default false
);

-- Enable Row Level Security
alter table public.posts enable row level security;

-- Policy 1: Public Read Access (for published posts)
create policy "Public can view published posts"
on public.posts for select
to anon
using (is_published = true);

-- Policy 2: Admin Full Access (for authenticated users)
-- Note: This assumes any authenticated user is an admin. 
-- For a real production app, you might want a specific role check.
create policy "Authenticated users can do everything"
on public.posts for all
to authenticated
using (true)
with check (true);

-- Storage Bucket Setup (You might need to create the bucket 'blog-images' in the UI first, or use this if supported)
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Storage Policy: Public Read
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'blog-images' );

-- Storage Policy: Authenticated Upload
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'blog-images' );
