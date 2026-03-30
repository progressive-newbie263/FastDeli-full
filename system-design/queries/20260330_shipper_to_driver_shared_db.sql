UPDATE public.users
SET role = 'driver'
WHERE role = 'shipper';

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS check_user_role;

ALTER TABLE public.users
ADD CONSTRAINT check_user_role
CHECK (
  ((role)::text = ANY (
    (ARRAY[
      'customer'::character varying,
      'restaurant_owner'::character varying,
      'admin'::character varying,
      'driver'::character varying
    ])::text[]
  ))
);

COMMIT;