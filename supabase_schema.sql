create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- POSTS TABLE (Updated)
-- Run this command to add the user_id column to your existing posts table:
alter table public.posts add column if not exists user_id uuid references auth.users(id) default auth.uid();

create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_published boolean default false,
  user_id uuid references auth.users(id) default auth.uid()
);

-- Enable Row Level Security
alter table public.posts enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Public can view published posts" on public.posts;
drop policy if exists "Authenticated users can do everything" on public.posts;

-- Policy 1: Public Read Access (Published posts)
create policy "Public can view published posts"
on public.posts for select
to anon, authenticated
using (is_published = true);

-- Policy 2: Authors can view their own drafts
create policy "Authors can view own drafts"
on public.posts for select
to authenticated
using (auth.uid() = user_id);

-- Policy 3: Admins can view everything
create policy "Admins can view everything"
on public.posts for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Policy 4: Insert (Authenticated Users)
create policy "Authenticated users can create posts"
on public.posts for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy 5: Update/Delete (Owner OR Admin)
create policy "Owners and Admins can update posts"
on public.posts for update
to authenticated
using (
  auth.uid() = user_id or
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Owners and Admins can delete posts"
on public.posts for delete
to authenticated
using (
  auth.uid() = user_id or
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);


-- LIKES TABLE
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

alter table public.likes enable row level security;

create policy "Public can view likes"
on public.likes for select
using (true);

create policy "Authenticated users can like"
on public.likes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can unlike"
on public.likes for delete
to authenticated
using (auth.uid() = user_id);


-- COMMENTS TABLE
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;

create policy "Public can view comments"
on public.comments for select
using (true);

create policy "Authenticated users can comment"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete own comments"
on public.comments for delete
to authenticated
using (auth.uid() = user_id);

create policy "Admins can delete any comment"
on public.comments for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Storage Bucket Setup (Idempotent)
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Storage Policy: Public Read
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'blog-images' );

-- Storage Policy: Authenticated Upload
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'blog-images' );

-- FOLLOWS TABLE
create table public.follows (
  follower_id uuid references auth.users(id) not null,
  following_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Public can view follows"
on public.follows for select
using (true);

create policy "Authenticated users can follow"
on public.follows for insert
to authenticated
with check (auth.uid() = follower_id);

create policy "Users can unfollow"
on public.follows for delete
to authenticated
using (auth.uid() = follower_id);
