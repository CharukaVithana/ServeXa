create table if not exists bookings (
  id uuid primary key,
  full_name varchar(120) not null,
  phone varchar(32) not null,
  vehicle_type varchar(64) not null,
  service_type varchar(32) not null,
  booking_date date not null,
  booking_time time not null,
  notes text,
  payment_method varchar(32) not null,
  status varchar(24) not null,
  is_assigned boolean not null,
  assigned_employee_id uuid,
  duration integer not null,
  customer_id uuid not null,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone
);
