-- Add fid column to points table for easier querying
alter table points add column fid bigint;

-- Backfill existing points with fid from users table
update points
set fid = users.fid
from users
where points.user_id = users.id;

-- Make fid not null after backfill
alter table points alter column fid set not null;

-- Add index on fid for faster lookups
create index idx_points_fid on points(fid);

-- Add foreign key constraint to ensure data integrity
alter table points
add constraint fk_points_fid
foreign key (fid) references users(fid)
on delete cascade;

