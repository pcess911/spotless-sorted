create extension if not exists "uuid-ossp";

create table if not exists public.bookings (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now() not null,
    full_name text not null,
    phone text not null,
    email text not null,
    service_type text not null,
    preferred_date date not null,
    preferred_time text not null,
    location text not null,
    special_instructions text,
    status text default 'New'
        check (status in ('New', 'Confirmed', 'Completed', 'Cancelled'))
        not null
);

create table if not exists public.quotes (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now() not null,
    full_name text not null,
    phone text not null,
    email text not null,
    service_type text not null,
    description text not null,
    additional_details text,
    status text default 'New'
        check (status in ('New', 'Contacted', 'Closed'))
        not null
);

create table if not exists public.enquiries (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now() not null,
    full_name text not null,
    email text not null,
    subject text not null,
    message text not null,
    status text default 'New'
        check (status in ('New', 'Replied', 'Archived'))
        not null
);

alter table public.bookings enable row level security;
alter table public.quotes enable row level security;
alter table public.enquiries enable row level security;

create policy "Customers can submit bookings"
on public.bookings
for insert
to anon, authenticated
with check (true);

create policy "Owners can view bookings"
on public.bookings
for select
to authenticated
using (true);

create policy "Owners can update bookings"
on public.bookings
for update
to authenticated
using (true)
with check (true);

create policy "Customers can submit quotes"
on public.quotes
for insert
to anon, authenticated
with check (true);

create policy "Owners can view quotes"
on public.quotes
for select
to authenticated
using (true);

create policy "Owners can update quotes"
on public.quotes
for update
to authenticated
using (true)
with check (true);

create policy "Customers can submit enquiries"
on public.enquiries
for insert
to anon, authenticated
with check (true);

create policy "Owners can view enquiries"
on public.enquiries
for select
to authenticated
using (true);

create policy "Owners can update enquiries"
on public.enquiries
for update
to authenticated
using (true)
with check (true);
