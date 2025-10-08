-- Create view for detailed points report by user FID
create or replace view user_points_report as
select 
  p.id as point_id,
  p.fid,
  u.preferred_wallet,
  p.source,
  p.amount,
  p.metadata,
  p.created_at,
  u.referrer_fid,
  u.created_at as user_joined_at
from points p
join users u on p.fid = u.fid
order by p.created_at desc;

