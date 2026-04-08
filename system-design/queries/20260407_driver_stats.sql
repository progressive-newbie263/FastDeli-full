
CREATE TABLE public.drivers (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL UNIQUE,
  full_name   VARCHAR(100) NOT NULL,
  phone       VARCHAR(15)  NOT NULL,
  status      VARCHAR(20)  DEFAULT 'offline' CONSTRAINT chk_driver_status CHECK (status IN ('online','offline','busy')),
  is_verified BOOLEAN      DEFAULT false,
  rating      NUMERIC(3,2) DEFAULT 0 CONSTRAINT chk_driver_rating CHECK (rating BETWEEN 0 AND 5),
  total_deliveries INTEGER  DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_status ON public.drivers(status) WHERE status = 'online';
CREATE INDEX idx_drivers_user_id ON public.drivers(user_id);

-- 2. Bảng toạ độ thời gian thực của tài xế
CREATE TABLE public.driver_locations (
  driver_id   INTEGER PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
  latitude    NUMERIC(10,6) NOT NULL,
  longitude   NUMERIC(10,6) NOT NULL,
  accuracy    NUMERIC(6,2),
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_driver_locations_lat_lng ON public.driver_locations(latitude, longitude);

-- 3. Bảng ghép đơn hàng
CREATE TABLE public.delivery_assignments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id INTEGER NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'accepted' CONSTRAINT chk_assignment_status CHECK (
    status IN ('accepted', 'picking_up', 'delivering', 'completed', 'cancelled')
  ),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
CREATE INDEX idx_delivery_assignments_driver ON public.delivery_assignments(driver_id);

-- 4. Bảng Thu nhập
CREATE TABLE public.driver_earnings (
  id              SERIAL PRIMARY KEY,
  driver_id       INTEGER NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  assignment_id   INTEGER REFERENCES public.delivery_assignments(id) ON DELETE SET NULL,
  amount          NUMERIC(10,2) NOT NULL,
  type            VARCHAR(30) DEFAULT 'delivery_fee' CONSTRAINT chk_earning_type CHECK (
    type IN ('delivery_fee','tip','bonus','adjustment')
  ),
  earned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_earnings_driver ON public.driver_earnings(driver_id);