create view user_points_total as
select 
  u.id as user_id,
  u.fid,
  coalesce(sum(p.amount), 0) as total_points
from users u
left join points p on p.user_id = u.id
group by u.id, u.fid;