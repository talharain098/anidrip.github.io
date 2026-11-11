-- AniDrip: run this once in a NEW Supabase project: SQL Editor -> New query -> Run
create table if not exists products(
  id text primary key,
  data jsonb not null,
  sort int default 0,
  created_at timestamptz default now()
);
alter table products enable row level security;
create policy "public read products" on products for select using (true);
create policy "admin write products" on products for all to authenticated using (true) with check (true);

insert into storage.buckets(id,name,public) values('product-images','product-images',true) on conflict do nothing;
create policy "public read images" on storage.objects for select using (bucket_id='product-images');
create policy "admin upload images" on storage.objects for insert to authenticated with check (bucket_id='product-images');
create policy "admin update images" on storage.objects for update to authenticated using (bucket_id='product-images');
create policy "admin delete images" on storage.objects for delete to authenticated using (bucket_id='product-images');

-- Custom-design previews: the website uploads the customer's mockup image here and puts the link in the WhatsApp message.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('designs','designs',true,12582912,array['image/jpeg','image/png']) on conflict do nothing;
create policy "public read designs" on storage.objects for select using (bucket_id='designs');
create policy "anyone can upload designs" on storage.objects for insert to anon, authenticated with check (bucket_id='designs');
