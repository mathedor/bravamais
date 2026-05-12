-- ============================================================
-- BRAVA+ — Geo sync trigger + nearby search RPC
-- ============================================================

create or replace function public.sync_establishment_location()
returns trigger language plpgsql as $$
begin
  if new.lat is not null and new.lng is not null then
    new.location := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  else
    new.location := null;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_establishment_location_trigger on public.establishments;
create trigger sync_establishment_location_trigger
  before insert or update of lat, lng on public.establishments
  for each row execute function public.sync_establishment_location();

-- Backfill existing rows with lat/lng
update public.establishments
set lat = lat
where lat is not null and lng is not null and location is null;

-- ============================================================
-- RPC: search_establishments
-- Args: q (text), category_slugs (text[]), promo_types (promotion_type[]),
--       user_lat, user_lng, max_distance_km, sort ('nearest'|'rating'|'recent')
-- Returns establishments + computed distance_km
-- ============================================================
create or replace function public.search_establishments(
  q text default null,
  category_slugs text[] default null,
  promo_types promotion_type[] default null,
  user_lat double precision default null,
  user_lng double precision default null,
  max_distance_km double precision default null,
  sort_by text default 'nearest',
  page_size int default 24,
  page_offset int default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  tagline text,
  city text,
  state char(2),
  logo_url text,
  cover_url text,
  photos text[],
  average_rating numeric,
  total_reviews int,
  total_visits int,
  distance_km double precision
)
language plpgsql stable security definer set search_path = public as $$
declare
  user_point geography;
begin
  if user_lat is not null and user_lng is not null then
    user_point := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
  end if;

  return query
  select
    e.id, e.slug, e.name, e.tagline, e.city, e.state,
    e.logo_url, e.cover_url, e.photos,
    e.average_rating, e.total_reviews, e.total_visits,
    case when user_point is not null and e.location is not null
         then ST_Distance(e.location, user_point) / 1000.0
         else null end as distance_km
  from public.establishments e
  where e.is_active = true
    and (q is null or e.name ilike '%' || q || '%' or e.tagline ilike '%' || q || '%' or e.description ilike '%' || q || '%')
    and (category_slugs is null or exists (
      select 1 from public.establishment_categories ec
      join public.categories c on c.id = ec.category_id
      where ec.establishment_id = e.id and c.slug = any(category_slugs)
    ))
    and (promo_types is null or exists (
      select 1 from public.establishment_promotions ep
      where ep.establishment_id = e.id
        and ep.is_active = true
        and ep.promotion_type = any(promo_types)
    ))
    and (
      max_distance_km is null or user_point is null or e.location is null
      or ST_DWithin(e.location, user_point, max_distance_km * 1000)
    )
  order by
    case when sort_by = 'nearest' and user_point is not null and e.location is not null
         then ST_Distance(e.location, user_point) end nulls last,
    case when sort_by = 'rating' then e.average_rating end desc nulls last,
    case when sort_by = 'recent' then e.created_at end desc nulls last,
    e.name
  limit page_size offset page_offset;
end;
$$;

grant execute on function public.search_establishments to anon, authenticated;
