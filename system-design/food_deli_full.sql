--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-04-07 09:34:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 235 (class 1255 OID 271348)
-- Name: generate_order_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Gán order_code dựa vào id được gán bởi sequence
  NEW.order_code := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL(pg_get_serial_sequence('orders','id'))::text, 6, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_order_code() OWNER TO postgres;

--
-- TOC entry 236 (class 1255 OID 574889)
-- Name: update_nutrition_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_nutrition_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_nutrition_timestamp() OWNER TO postgres;

--
-- TOC entry 234 (class 1255 OID 419017)
-- Name: update_restaurants_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_restaurants_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_restaurants_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 229 (class 1259 OID 533865)
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_order_value numeric(10,2) DEFAULT 0,
    max_discount numeric(10,2),
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    is_platform boolean DEFAULT true,
    is_active boolean DEFAULT true,
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    restaurant_id integer,
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed_amount'::character varying])::text[]))),
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value > (0)::numeric)),
    CONSTRAINT coupons_min_order_amount_check CHECK ((min_order_value >= (0)::numeric))
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 533864)
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_id_seq OWNER TO postgres;

--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 228
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- TOC entry 220 (class 1259 OID 98980)
-- Name: food_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.food_categories (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL,
    image_url text
);


ALTER TABLE public.food_categories OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 98979)
-- Name: food_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.food_categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.food_categories_category_id_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 219
-- Name: food_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.food_categories_category_id_seq OWNED BY public.food_categories.category_id;


--
-- TOC entry 231 (class 1259 OID 574872)
-- Name: food_nutrition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.food_nutrition (
    nutrition_id integer NOT NULL,
    food_id integer NOT NULL,
    serving_size character varying(100) DEFAULT '100g'::character varying,
    calories numeric(8,2),
    protein numeric(8,2),
    fat numeric(8,2),
    sugar numeric(8,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.food_nutrition OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE food_nutrition; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.food_nutrition IS 'Thông tin dinh dưỡng cơ bản cho món ăn (version đơn giản)';


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN food_nutrition.serving_size; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.food_nutrition.serving_size IS 'Kích thước phần ăn (e.g., "100g", "1 suất", "1 tô")';


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN food_nutrition.calories; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.food_nutrition.calories IS 'Calories - Năng lượng (kcal)';


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN food_nutrition.protein; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.food_nutrition.protein IS 'Protein - Chất đạm (g)';


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN food_nutrition.fat; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.food_nutrition.fat IS 'Fat - Chất béo (g)';


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN food_nutrition.sugar; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.food_nutrition.sugar IS 'Sugar - Đường (g)';


--
-- TOC entry 230 (class 1259 OID 574871)
-- Name: food_nutrition_nutrition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.food_nutrition_nutrition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.food_nutrition_nutrition_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 230
-- Name: food_nutrition_nutrition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.food_nutrition_nutrition_id_seq OWNED BY public.food_nutrition.nutrition_id;


--
-- TOC entry 222 (class 1259 OID 98989)
-- Name: foods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foods (
    food_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    food_name character varying(150) NOT NULL,
    description text DEFAULT 'Chưa có mô tả về món ăn này'::text,
    price numeric(10,2) NOT NULL,
    image_url text DEFAULT 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s'::text,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_featured boolean DEFAULT false,
    primary_category_id integer NOT NULL,
    secondary_category_id integer
);


ALTER TABLE public.foods OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 98988)
-- Name: foods_food_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.foods_food_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.foods_food_id_seq OWNER TO postgres;

--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 221
-- Name: foods_food_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.foods_food_id_seq OWNED BY public.foods.food_id;


--
-- TOC entry 224 (class 1259 OID 99028)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    order_item_id integer NOT NULL,
    order_id integer NOT NULL,
    food_id integer NOT NULL,
    food_name character varying(150) NOT NULL,
    food_price numeric(10,2) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 99027)
-- Name: order_items_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_order_item_id_seq OWNER TO postgres;

--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_items_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_order_item_id_seq OWNED BY public.order_items.order_item_id;


--
-- TOC entry 226 (class 1259 OID 271328)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_code character varying(20),
    user_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    user_name character varying(100) NOT NULL,
    user_phone character varying(15) NOT NULL,
    delivery_address text NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 0,
    order_status character varying(30) DEFAULT 'pending'::character varying,
    payment_status character varying(30) DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_method character varying(50) DEFAULT 'cash'::character varying,
    coupon_id integer,
    coupon_code character varying(50),
    discount_amount numeric(10,2) DEFAULT 0,
    original_total numeric(10,2),
    delivery_latitude numeric(10,6),
    delivery_longitude numeric(10,6),
    CONSTRAINT orders_discount_amount_check CHECK ((discount_amount >= (0)::numeric)),
    CONSTRAINT orders_order_status_check CHECK (((order_status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'processing'::character varying, 'delivering'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'momo'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 271327)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 227 (class 1259 OID 476390)
-- Name: restaurant_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_locations (
    restaurant_id integer NOT NULL,
    longitude numeric(9,6),
    latitude numeric(9,6)
);


ALTER TABLE public.restaurant_locations OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 98963)
-- Name: restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurants (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    address character varying(255) NOT NULL,
    phone character varying(15),
    image_url text DEFAULT 'https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg'::text,
    description text,
    delivery_fee numeric(8,2) DEFAULT 15000,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    owner_id integer,
    email character varying(255),
    updated_at timestamp without time zone DEFAULT now(),
    delivery_time_min integer DEFAULT 20,
    delivery_time_max integer DEFAULT 30,
    min_order_value numeric(10,2) DEFAULT 0,
    opening_time time without time zone DEFAULT '08:00:00'::time without time zone,
    closing_time time without time zone DEFAULT '22:00:00'::time without time zone,
    verification_status character varying(50) DEFAULT 'approved'::character varying,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_delivery_fee_non_negative CHECK ((delivery_fee >= (0)::numeric)),
    CONSTRAINT chk_delivery_time_range CHECK ((delivery_time_min <= delivery_time_max)),
    CONSTRAINT chk_min_order_value_non_negative CHECK ((min_order_value >= (0)::numeric)),
    CONSTRAINT chk_rating_range CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric))),
    CONSTRAINT chk_total_reviews_non_negative CHECK ((total_reviews >= 0)),
    CONSTRAINT chk_verification_status CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT restaurants_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'closed'::character varying, 'banned'::character varying, 'pending'::character varying])::text[])))
);


ALTER TABLE public.restaurants OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN restaurants.owner_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurants.owner_id IS 'Foreign key tới users.user_id trong db-shared-deli - chủ sở hữu nhà hàng';


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN restaurants.verification_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurants.verification_status IS 'Trạng thái xác minh: pending, approved, rejected';


--
-- TOC entry 217 (class 1259 OID 98962)
-- Name: restaurants_restaurant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurants_restaurant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurants_restaurant_id_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 217
-- Name: restaurants_restaurant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurants_restaurant_id_seq OWNED BY public.restaurants.id;


--
-- TOC entry 233 (class 1259 OID 599478)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 599477)
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_review_id_seq OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 232
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- TOC entry 4817 (class 2604 OID 533868)
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 98983)
-- Name: food_categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_categories ALTER COLUMN category_id SET DEFAULT nextval('public.food_categories_category_id_seq'::regclass);


--
-- TOC entry 4822 (class 2604 OID 574875)
-- Name: food_nutrition nutrition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_nutrition ALTER COLUMN nutrition_id SET DEFAULT nextval('public.food_nutrition_nutrition_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 98992)
-- Name: foods food_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods ALTER COLUMN food_id SET DEFAULT nextval('public.foods_food_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 99031)
-- Name: order_items order_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN order_item_id SET DEFAULT nextval('public.order_items_order_item_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 271331)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 98966)
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_restaurant_id_seq'::regclass);


--
-- TOC entry 4826 (class 2604 OID 599481)
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- TOC entry 5070 (class 0 OID 533865)
-- Dependencies: 229
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, is_platform, is_active, image_url, created_at, restaurant_id) FROM stdin;
1	PROMO2	Giảm 30% cho mọi đơn hàng trên 120k vào Chủ Nhật, tối đa lên đến 80k	Áp dụng cho tất cả đơn hàng từ 120k trở lên	percentage	30.00	120000.00	80000.00	2025-01-01 00:00:00	2026-12-31 00:00:00	t	t	https://res.cloudinary.com/dpldznnma/image/upload/v1759474865/discount-30-percent-thumbnail.png	2025-10-01 16:54:10.903594	\N
2	PROMO3	Pizza House tặng 50k	Giảm trực tiếp 50k cho đơn từ 200k	fixed_amount	50000.00	200000.00	50000.00	2025-01-01 00:00:00	2025-12-31 00:00:00	f	t	https://res.cloudinary.com/dpldznnma/image/upload/v1759474814/discount-50k-thumbnail.png	2025-10-01 16:54:10.903594	\N
3	PROMO1	Giảm 20% cho mọi đơn hàng trên 80k từ T2-T6, tối đa lên đến 50k	Áp dụng cho tất cả đơn hàng trên 80k	percentage	20.00	80000.00	50000.00	2025-01-01 00:00:00	2026-12-31 00:00:00	t	t	https://res.cloudinary.com/dpldznnma/image/upload/v1759474862/discount-20-percent-thumbnail.png	2025-10-01 16:54:10.903594	\N
4	PROMO4	TEST ONLY: Giảm 99% (dummy)	Coupon này chỉ để test hiển thị, không dùng thật	percentage	99.00	1.00	999999.00	2023-01-01 00:00:00	2024-12-31 00:00:00	t	t	https://res.cloudinary.com/dpldznnma/image/upload/v1759474917/discount-default-thumbnail.png	2025-10-03 13:42:56.01604	\N
5	FAST100	FastDeli tặng bạn 100k cho mọi đơn hàng từ 300k trở lên	Áp dụng cho tất cả đơn hàng từ 300k trở lên	fixed_amount	100000.00	300000.00	100000.00	2026-01-01 00:00:00	2028-01-01 00:00:00	t	t	https://res.cloudinary.com/dpldznnma/image/upload/v1759474917/discount-default-thumbnail.png	2026-03-17 11:11:49.421509	\N
6	DEMO20	Nhà hàng Demo giảm giá 20% cho mọi đơn hàng	Áp dụng cho tất cả đơn hàng	percentage	20.00	0.00	\N	2026-01-01 00:00:00	2028-01-01 00:00:00	f	t	https://res.cloudinary.com/dpldznnma/image/upload/v1759474917/discount-default-thumbnail.png	2026-03-17 11:11:49.421509	29
7	PHN30	Giảm giá 30% cho mọi đơn hàng tại Phở Hà Nội	thử nghiệm	percentage	30.00	0.00	\N	2026-01-01 00:00:00	2030-01-01 23:59:59	f	t	https://res.cloudinary.com/dpldznnma/image/upload/v1759474917/discount-default-thumbnail.png	2026-03-24 15:46:37.382076	30
8	BBQJACK20	Giảm giá 20k cho mọi đơn hàng	.Áp dụng cho mọi đơn hàng	fixed_amount	20000.00	0.00	\N	2025-03-26 00:00:00	2028-01-01 23:59:59	f	t	https://res.cloudinary.com/dpldznnma/image/upload/v1759474917/discount-default-thumbnail.png	2026-03-26 09:46:05.461212	32
9	BBQ25P	Giảm giá 25% cho mọi đơn hàng tại BBQ Jack	không có điều kiện nào khác	percentage	25.00	0.00	\N	2019-12-31 00:00:00	2030-01-01 23:59:59	f	t	https://res.cloudinary.com/dpldznnma/image/upload/v1774497160/coupons/coupon_9.jpg	2026-03-26 10:37:44.677305	32
10	BB2803	giảm 20%, test	giảm giá 20% cho mọi đơn hàng	percentage	19.00	0.00	\N	2025-10-09 00:00:00	2025-12-31 23:59:59	f	t	https://res.cloudinary.com/dpldznnma/image/upload/v1774682667/restaurants/restaurant_32.jpg	2026-03-28 14:24:33.654881	32
11	BBQ30032026	Giảm giá 15% cho mọi đơn hàng, tối đa 50k	không có	percentage	15.00	200000.00	50000.00	2025-02-08 00:00:00	2026-12-31 23:59:59	f	t	https://res.cloudinary.com/dpldznnma/image/upload/v1774856962/coupons/coupon_11.jpg	2026-03-30 14:49:06.050366	32
\.


--
-- TOC entry 5061 (class 0 OID 98980)
-- Dependencies: 220
-- Data for Name: food_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.food_categories (category_id, category_name, image_url) FROM stdin;
1	Cơm	https://res.cloudinary.com/dpldznnma/foods/category=com
2	Gà	https://res.cloudinary.com/dpldznnma/foods/category=ga
3	Cháo	https://res.cloudinary.com/dpldznnma/foods/category=chao
4	Bánh mì	https://res.cloudinary.com/dpldznnma/foods/category=banh-mi
5	Đồ ăn nhanh	https://res.cloudinary.com/dpldznnma/foods/category=do-an-nhanh
6	Đồ uống	https://res.cloudinary.com/dpldznnma/foods/category=do-uong
7	Tráng miệng	https://res.cloudinary.com/dpldznnma/foods/category=trang-mieng
8	Khác	https://res.cloudinary.com/dpldznnma/foods/category=khac
\.


--
-- TOC entry 5072 (class 0 OID 574872)
-- Dependencies: 231
-- Data for Name: food_nutrition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.food_nutrition (nutrition_id, food_id, serving_size, calories, protein, fat, sugar, created_at, updated_at) FROM stdin;
1	20	100g thịt bò, 2 trứng, 100g cơm	452.00	35.30	23.40	0.50	2026-03-12 11:24:22.956661	2026-03-12 13:22:02.023311
3	19	200g thịt bò	396.00	38.90	25.40	0.00	2026-03-12 13:35:41.137951	2026-03-14 14:25:41.579215
6	26	1 quả trứng	79.00	6.90	5.20	0.20	2026-03-18 13:29:55.802123	2026-03-18 13:29:55.802123
7	27	100g vịt	136.00	18.70	4.60	0.00	2026-03-18 16:14:42.465765	2026-03-18 16:14:42.465765
8	28	300g cơm, 2 quả trứng	448.00	19.90	11.00	0.60	2026-03-24 09:51:05.014669	2026-03-24 09:51:05.014669
\.


--
-- TOC entry 5063 (class 0 OID 98989)
-- Dependencies: 222
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.foods (food_id, restaurant_id, food_name, description, price, image_url, is_available, created_at, is_featured, primary_category_id, secondary_category_id) FROM stdin;
11	1	Cơm Tấm Bì Chả	Cơm tấm truyền thống với bì và chả	40000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	1	8
13	2	Pizza Margherita	Pizza cơ bản với phô mai và cà chua	120000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	5	8
14	2	Pizza Hải Sản	Pizza với tôm, mực, cua	180000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	5	8
17	3	Trà Sữa Matcha	Trà sữa vị matcha Nhật Bản	35000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	6	8
18	3	Bánh Flan	Bánh flan mềm mịn	20000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	7	\N
29	32	Mỳ tôm	...	15000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1774857850/foods/food_29.jpg	t	2026-03-28 14:13:31.037073	f	8	\N
19	29	Cơm Tấm Sườn	Cơm tấm sườn nướng	45000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1773714150/foods/food_19.jpg	t	2026-01-24 09:33:01.54336	f	1	\N
28	30	Cơm chiên thập cẩm		45000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1774320641/foods/food_28.jpg	t	2026-03-24 09:50:07.948004	t	1	\N
20	29	Pizza Margherita	Pizza phô mai cà chua siêu cấp vip pro	125000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1773297719/foods/food_20.jpg	t	2026-01-24 09:33:01.54336	t	5	\N
22	30	Phở bò tái	phở bò tái	50000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1773715438/foods/food_22.jpg	t	2026-03-17 09:43:49.995995	t	8	\N
24	30	quẩy	5 cái	10000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1773716263/foods/food_24.jpg	t	2026-03-17 09:57:32.980026	t	8	\N
25	32	Thăn bò nướng kiểu Hàn Quốc	ngon, đậm sốt\n1kg	450000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1773815290/foods/food_25.jpg	t	2026-03-18 13:27:26.470578	t	8	\N
26	32	Bánh mì	1 cái	10000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1773815360/foods/food_26.jpg	t	2026-03-18 13:29:07.828128	t	4	\N
27	32	canh măng nấu vịt	măng nấu vịt siêu ngon	35000.00	https://res.cloudinary.com/dpldznnma/image/upload/v1773825209/foods/food_27.jpg	t	2026-03-18 16:12:45.048581	t	8	\N
10	1	Cơm Tấm Sườn Nướng	Cơm tấm với sườn nướng thơm ngon	45000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	t	1	2
12	1	Nước Ngọt	Coca Cola, Pepsi, 7Up	15000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	t	6	\N
15	2	Nước Cam Tươi	Nước cam vắt tươi	25000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	t	6	\N
16	3	Trà Sữa Truyền Thống	Trà sữa đài loan chính hiệu	30000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	t	6	8
\.


--
-- TOC entry 5065 (class 0 OID 99028)
-- Dependencies: 224
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (order_item_id, order_id, food_id, food_name, food_price, quantity, created_at) FROM stdin;
53	2	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-09-17 10:10:54.231522
54	2	12	Nước Ngọt	15000.00	1	2025-09-17 10:10:54.231522
55	3	13	Pizza Margherita	120000.00	15	2025-09-17 10:11:46.841852
56	3	14	Pizza Hải Sản	180000.00	20	2025-09-17 10:11:46.841852
57	4	13	Pizza Margherita	120000.00	15	2025-09-17 10:14:51.427523
58	4	14	Pizza Hải Sản	180000.00	20	2025-09-17 10:14:51.427523
59	6	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-09-17 10:15:24.030196
60	8	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-09-17 10:20:49.285754
61	8	11	Cơm Tấm Bì Chả	40000.00	3	2025-09-17 10:20:49.285754
62	8	12	Nước Ngọt	15000.00	3	2025-09-17 10:20:49.285754
63	10	14	Pizza Hải Sản	180000.00	3	2025-09-17 10:21:23.918529
64	12	10	Cơm Tấm Sườn Nướng	45000.00	3	2025-09-17 14:01:12.853016
65	12	11	Cơm Tấm Bì Chả	40000.00	2	2025-09-17 14:01:12.853016
66	14	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-09-17 14:04:55.059238
67	16	10	Cơm Tấm Sườn Nướng	45000.00	1	2025-09-17 14:07:48.935474
68	18	14	Pizza Hải Sản	180000.00	2	2025-09-17 14:09:12.469621
69	20	10	Cơm Tấm Sườn Nướng	45000.00	1	2025-09-17 14:09:53.587675
70	20	11	Cơm Tấm Bì Chả	40000.00	2	2025-09-17 14:09:53.587675
71	22	16	Trà Sữa Truyền Thống	30000.00	2	2025-09-18 15:32:58.286575
72	22	18	Bánh Flan	20000.00	2	2025-09-18 15:32:58.286575
73	24	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-09-18 16:57:43.33398
74	24	11	Cơm Tấm Bì Chả	40000.00	5	2025-09-18 16:57:43.33398
75	24	12	Nước Ngọt	15000.00	5	2025-09-18 16:57:43.33398
76	26	10	Cơm Tấm Sườn Nướng	45000.00	3	2025-09-18 17:15:35.820985
77	26	11	Cơm Tấm Bì Chả	40000.00	2	2025-09-18 17:15:35.820985
78	28	13	Pizza Margherita	120000.00	15	2025-09-18 17:16:30.464816
79	28	14	Pizza Hải Sản	180000.00	20	2025-09-18 17:16:30.464816
80	30	10	Cơm Tấm Sườn Nướng	45000.00	4	2025-09-20 18:24:08.107336
81	30	11	Cơm Tấm Bì Chả	40000.00	1	2025-09-20 18:24:08.107336
82	32	16	Trà Sữa Truyền Thống	30000.00	104	2025-09-21 22:48:20.196274
83	34	11	Cơm Tấm Bì Chả	40000.00	2	2025-09-23 02:49:58.530814
84	36	11	Cơm Tấm Bì Chả	40000.00	2	2025-09-23 02:57:39.48808
85	38	11	Cơm Tấm Bì Chả	40000.00	2	2025-09-23 03:07:44.233917
86	40	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-09-23 03:10:49.900602
87	40	11	Cơm Tấm Bì Chả	40000.00	1	2025-09-23 03:10:49.900602
88	40	12	Nước Ngọt	15000.00	2	2025-09-23 03:10:49.900602
89	42	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-09-23 16:23:35.089958
90	42	11	Cơm Tấm Bì Chả	40000.00	4	2025-09-23 16:23:35.089958
91	42	12	Nước Ngọt	15000.00	5	2025-09-23 16:23:35.089958
92	44	13	Pizza Margherita	120000.00	3	2025-09-23 16:49:40.525041
93	44	14	Pizza Hải Sản	180000.00	3	2025-09-23 16:49:40.525041
94	44	15	Nước Cam Tươi	25000.00	3	2025-09-23 16:49:40.525041
95	46	10	Cơm Tấm Sườn Nướng	45000.00	3	2025-09-23 17:27:15.493597
96	46	12	Nước Ngọt	15000.00	2	2025-09-23 17:27:15.493597
97	48	11	Cơm Tấm Bì Chả	40000.00	5	2025-09-23 17:51:19.248513
98	50	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-10-01 12:10:58.98218
99	50	11	Cơm Tấm Bì Chả	40000.00	4	2025-10-01 12:10:58.98218
100	50	12	Nước Ngọt	15000.00	2	2025-10-01 12:10:58.98218
101	52	16	Trà Sữa Truyền Thống	30000.00	3	2025-10-03 14:43:35.539465
102	52	17	Trà Sữa Matcha	35000.00	3	2025-10-03 14:43:35.539465
103	52	18	Bánh Flan	20000.00	2	2025-10-03 14:43:35.539465
104	54	16	Trà Sữa Truyền Thống	30000.00	4	2025-10-04 17:15:08.895383
105	56	16	Trà Sữa Truyền Thống	30000.00	3	2025-10-16 13:46:32.236319
106	56	17	Trà Sữa Matcha	35000.00	5	2025-10-16 13:46:32.236319
107	56	18	Bánh Flan	20000.00	3	2025-10-16 13:46:32.236319
108	58	16	Trà Sữa Truyền Thống	30000.00	3	2025-11-04 16:40:03.52191
109	58	17	Trà Sữa Matcha	35000.00	1	2025-11-04 16:40:03.52191
110	58	18	Bánh Flan	20000.00	1	2025-11-04 16:40:03.52191
111	60	10	Cơm Tấm Sườn Nướng	45000.00	2	2025-11-20 15:45:42.841176
112	60	12	Nước Ngọt	15000.00	2	2025-11-20 15:45:42.841176
113	62	17	Trà Sữa Matcha	35000.00	4	2025-12-03 13:57:27.194161
114	62	18	Bánh Flan	20000.00	3	2025-12-03 13:57:27.194161
115	64	13	Pizza Margherita	120000.00	15	2025-12-18 11:39:04.560376
116	64	14	Pizza Hải Sản	180000.00	20	2025-12-18 11:39:04.560376
117	66	16	Trà Sữa Truyền Thống	30000.00	3	2025-12-18 15:27:18.16781
118	66	17	Trà Sữa Matcha	35000.00	3	2025-12-18 15:27:18.16781
119	68	16	Trà Sữa Truyền Thống	30000.00	2	2025-12-19 14:38:41.297904
120	68	17	Trà Sữa Matcha	35000.00	2	2025-12-19 14:38:41.297904
121	70	11	Cơm Tấm Bì Chả	40000.00	3	2025-12-22 16:27:54.136391
122	70	12	Nước Ngọt	15000.00	3	2025-12-22 16:27:54.136391
123	72	13	Pizza Margherita	120000.00	3	2025-12-22 17:02:25.319468
124	72	14	Pizza Hải Sản	180000.00	2	2025-12-22 17:02:25.319468
125	72	15	Nước Cam Tươi	25000.00	4	2025-12-22 17:02:25.319468
126	74	10	Cơm Tấm Sườn Nướng	45000.00	4	2025-12-28 17:15:48.578687
127	74	11	Cơm Tấm Bì Chả	40000.00	2	2025-12-28 17:15:48.578687
128	74	12	Nước Ngọt	15000.00	4	2025-12-28 17:15:48.578687
129	76	13	Pizza Margherita	120000.00	2	2025-12-29 14:24:45.838253
130	76	14	Pizza Hải Sản	180000.00	2	2025-12-29 14:24:45.838253
131	76	15	Nước Cam Tươi	25000.00	2	2025-12-29 14:24:45.838253
132	78	16	Trà Sữa Truyền Thống	30000.00	2	2026-01-02 16:20:05.072466
133	78	17	Trà Sữa Matcha	35000.00	1	2026-01-02 16:20:05.072466
134	78	18	Bánh Flan	20000.00	3	2026-01-02 16:20:05.072466
135	80	10	Cơm Tấm Sườn Nướng	45000.00	1	2026-01-03 16:40:03.798809
136	80	11	Cơm Tấm Bì Chả	40000.00	1	2026-01-03 16:40:03.798809
137	80	12	Nước Ngọt	15000.00	3	2026-01-03 16:40:03.798809
138	82	16	Trà Sữa Truyền Thống	30000.00	2	2026-01-03 16:44:10.972232
139	84	13	Pizza Margherita	120000.00	3	2026-01-05 13:37:02.432272
140	84	14	Pizza Hải Sản	180000.00	1	2026-01-05 13:37:02.432272
141	84	15	Nước Cam Tươi	25000.00	1	2026-01-05 13:37:02.432272
142	86	10	Cơm Tấm Sườn Nướng	45000.00	2	2026-01-10 17:25:56.741319
143	86	11	Cơm Tấm Bì Chả	40000.00	2	2026-01-10 17:25:56.741319
144	86	12	Nước Ngọt	15000.00	1	2026-01-10 17:25:56.741319
145	88	16	Trà Sữa Truyền Thống	30000.00	3	2026-01-10 17:26:49.102327
146	88	17	Trà Sữa Matcha	35000.00	2	2026-01-10 17:26:49.102327
147	88	18	Bánh Flan	20000.00	3	2026-01-10 17:26:49.102327
148	90	14	Pizza Hải Sản	180000.00	2	2026-01-10 17:51:37.172789
149	92	16	Trà Sữa Truyền Thống	30000.00	5	2026-01-12 15:26:24.010466
150	92	17	Trà Sữa Matcha	35000.00	1	2026-01-12 15:26:24.010466
151	92	18	Bánh Flan	20000.00	2	2026-01-12 15:26:24.010466
152	94	13	Pizza Margherita	120000.00	4	2026-01-12 19:10:27.305716
153	94	14	Pizza Hải Sản	180000.00	1	2026-01-12 19:10:27.305716
154	94	15	Nước Cam Tươi	25000.00	3	2026-01-12 19:10:27.305716
155	96	13	Pizza Margherita	120000.00	1	2026-01-17 17:09:00.575623
156	96	14	Pizza Hải Sản	180000.00	2	2026-01-17 17:09:00.575623
157	96	15	Nước Cam Tươi	25000.00	2	2026-01-17 17:09:00.575623
158	98	10	Cơm Tấm Sườn Nướng	45000.00	2	2026-01-17 17:30:08.004148
159	98	11	Cơm Tấm Bì Chả	40000.00	2	2026-01-17 17:30:08.004148
160	98	12	Nước Ngọt	15000.00	2	2026-01-17 17:30:08.004148
161	100	10	Cơm Tấm Sườn Nướng	45000.00	1	2026-01-19 15:24:20.745388
162	100	11	Cơm Tấm Bì Chả	40000.00	1	2026-01-19 15:24:20.745388
163	100	12	Nước Ngọt	15000.00	2	2026-01-19 15:24:20.745388
164	102	19	Cơm Tấm Sườn	45000.00	1	2026-01-24 09:36:17.367371
165	102	20	Pizza Margherita	120000.00	1	2026-01-24 09:36:17.367371
166	104	19	Cơm Tấm Sườn	45000.00	1	2026-01-24 10:02:15.97745
167	104	20	Pizza Margherita	120000.00	1	2026-01-24 10:02:15.97745
168	106	19	Cơm Tấm Sườn	45000.00	3	2026-01-25 15:46:30.690526
169	106	20	Pizza Margherita	120000.00	2	2026-01-25 15:46:30.690526
170	108	19	Cơm Tấm Sườn	45000.00	2	2026-02-01 17:11:16.822168
171	108	20	Pizza Margherita	120000.00	2	2026-02-01 17:11:16.822168
172	110	19	Cơm Tấm Sườn	45000.00	2	2026-02-04 16:31:36.646052
173	110	20	Pizza Margherita	120000.00	1	2026-02-04 16:31:36.646052
174	112	19	Cơm Tấm Sườn	45000.00	1	2026-02-04 17:33:11.005581
175	112	20	Pizza Margherita	120000.00	1	2026-02-04 17:33:11.005581
176	114	19	Cơm Tấm Sườn	45000.00	1	2026-02-04 17:34:06.902178
177	114	20	Pizza Margherita	120000.00	1	2026-02-04 17:34:06.902178
178	116	19	Cơm Tấm Sườn	45000.00	1	2026-02-04 17:42:25.48283
179	116	20	Pizza Margherita	120000.00	1	2026-02-04 17:42:25.48283
180	118	19	Cơm Tấm Sườn	45000.00	1	2026-02-04 17:43:37.714199
181	118	20	Pizza Margherita	120000.00	1	2026-02-04 17:43:37.714199
182	120	13	Pizza Margherita	120000.00	1	2026-02-04 17:48:09.353661
183	120	15	Nước Cam Tươi	25000.00	3	2026-02-04 17:48:09.353661
184	122	16	Trà Sữa Truyền Thống	30000.00	1	2026-02-04 18:21:58.612025
185	122	18	Bánh Flan	20000.00	1	2026-02-04 18:21:58.612025
186	124	15	Nước Cam Tươi	25000.00	3	2026-02-04 18:26:14.561269
187	126	16	Trà Sữa Truyền Thống	30000.00	1	2026-02-05 15:31:19.58917
188	126	17	Trà Sữa Matcha	35000.00	2	2026-02-05 15:31:19.58917
189	126	18	Bánh Flan	20000.00	1	2026-02-05 15:31:19.58917
190	128	13	Pizza Margherita	120000.00	3	2026-02-05 15:32:10.030741
191	128	15	Nước Cam Tươi	25000.00	2	2026-02-05 15:32:10.030741
192	130	19	Cơm Tấm Sườn	45000.00	2	2026-02-05 15:58:52.562049
193	130	20	Pizza Margherita	120000.00	2	2026-02-05 15:58:52.562049
194	132	19	Cơm Tấm Sườn	45000.00	2	2026-02-05 16:06:03.857367
195	132	20	Pizza Margherita	120000.00	2	2026-02-05 16:06:03.857367
196	134	19	Cơm Tấm Sườn	45000.00	2	2026-02-05 16:49:49.629714
197	134	20	Pizza Margherita	120000.00	2	2026-02-05 16:49:49.629714
198	136	19	Cơm Tấm Sườn	45000.00	2	2026-02-05 17:08:03.460249
199	136	20	Pizza Margherita	120000.00	2	2026-02-05 17:08:03.460249
200	138	10	Cơm Tấm Sườn Nướng	45000.00	1	2026-02-05 17:19:09.760741
201	138	11	Cơm Tấm Bì Chả	40000.00	2	2026-02-05 17:19:09.760741
202	138	12	Nước Ngọt	15000.00	2	2026-02-05 17:19:09.760741
203	140	19	Cơm Tấm Sườn	45000.00	2	2026-02-07 11:46:47.363481
204	140	20	Pizza Margherita	120000.00	3	2026-02-07 11:46:47.363481
205	142	19	Cơm Tấm Sườn	45000.00	4	2026-02-07 11:47:33.447766
206	142	20	Pizza Margherita	120000.00	4	2026-02-07 11:47:33.447766
207	144	10	Cơm Tấm Sườn Nướng	45000.00	3	2026-02-07 16:41:34.520404
208	144	11	Cơm Tấm Bì Chả	40000.00	2	2026-02-07 16:41:34.520404
209	144	12	Nước Ngọt	15000.00	2	2026-02-07 16:41:34.520404
210	146	10	Cơm Tấm Sườn Nướng	45000.00	3	2026-02-09 11:06:16.457536
211	146	11	Cơm Tấm Bì Chả	40000.00	2	2026-02-09 11:06:16.457536
212	146	12	Nước Ngọt	15000.00	3	2026-02-09 11:06:16.457536
213	148	19	Cơm Tấm Sườn	45000.00	5	2026-02-09 17:15:10.582449
214	148	20	Pizza Margherita	120000.00	2	2026-02-09 17:15:10.582449
215	150	10	Cơm Tấm Sườn Nướng	45000.00	1	2026-02-18 09:06:22.030862
216	150	11	Cơm Tấm Bì Chả	40000.00	1	2026-02-18 09:06:22.030862
217	150	12	Nước Ngọt	15000.00	2	2026-02-18 09:06:22.030862
218	152	10	Cơm Tấm Sườn Nướng	45000.00	1	2026-02-18 12:55:56.095862
219	152	11	Cơm Tấm Bì Chả	40000.00	1	2026-02-18 12:55:56.095862
220	152	12	Nước Ngọt	15000.00	2	2026-02-18 12:55:56.095862
221	154	19	Cơm Tấm Sườn	45000.00	4	2026-02-18 13:08:16.493717
222	154	20	Pizza Margherita	120000.00	1	2026-02-18 13:08:16.493717
223	156	10	Cơm Tấm Sườn Nướng	45000.00	1	2026-02-18 13:18:26.927144
224	156	11	Cơm Tấm Bì Chả	40000.00	2	2026-02-18 13:18:26.927144
225	156	12	Nước Ngọt	15000.00	2	2026-02-18 13:18:26.927144
226	158	13	Pizza Margherita	120000.00	2	2026-02-18 13:23:39.463177
227	158	14	Pizza Hải Sản	180000.00	1	2026-02-18 13:23:39.463177
228	158	15	Nước Cam Tươi	25000.00	2	2026-02-18 13:23:39.463177
229	160	19	Cơm Tấm Sườn	45000.00	2	2026-02-18 14:05:56.70451
230	160	20	Pizza Margherita	120000.00	1	2026-02-18 14:05:56.70451
231	162	10	Cơm Tấm Sườn Nướng	45000.00	3	2026-02-19 14:40:44.829607
232	162	11	Cơm Tấm Bì Chả	40000.00	3	2026-02-19 14:40:44.829607
233	162	12	Nước Ngọt	15000.00	3	2026-02-19 14:40:44.829607
234	164	19	Cơm Tấm Sườn	45000.00	2	2026-02-25 16:47:19.393041
235	164	20	Pizza Margherita	120000.00	2	2026-02-25 16:47:19.393041
236	166	20	Pizza Margherita	120000.00	3	2026-02-28 11:31:25.191347
237	168	19	Cơm Tấm Sườn	45000.00	7	2026-03-01 17:18:28.859528
238	170	20	Pizza Margherita	120000.00	4	2026-03-04 14:08:25.247962
239	172	19	Cơm Tấm Sườn	45000.00	2	2026-03-07 14:24:14.895731
240	172	20	Pizza Margherita	120000.00	1	2026-03-07 14:24:14.895731
241	174	19	Cơm Tấm Sườn	45000.00	2	2026-03-07 14:24:29.538214
242	174	20	Pizza Margherita	120000.00	1	2026-03-07 14:24:29.538214
243	176	19	Cơm Tấm Sườn	45000.00	2	2026-03-13 15:28:12.710126
244	176	20	Pizza Margherita	120000.00	4	2026-03-13 15:28:12.710126
245	178	19	Cơm Tấm Sườn	45000.00	2	2026-03-14 13:51:10.306447
246	178	20	Pizza Margherita	120000.00	2	2026-03-14 13:51:10.306447
247	180	20	Pizza Margherita	120000.00	1	2026-03-14 14:21:20.422746
248	182	19	Cơm Tấm Sườn	45000.00	3	2026-03-14 14:23:37.233915
249	182	20	Pizza Margherita	120000.00	4	2026-03-14 14:23:37.233915
250	184	20	Pizza Margherita	120000.00	3	2026-03-15 17:17:21.054896
251	186	19	Cơm Tấm Sườn	45000.00	3	2026-03-15 17:18:08.194595
252	186	20	Pizza Margherita	120000.00	4	2026-03-15 17:18:08.194595
253	188	19	Cơm Tấm Sườn	45000.00	3	2026-03-15 17:18:19.165422
254	188	20	Pizza Margherita	120000.00	4	2026-03-15 17:18:19.165422
255	190	19	Cơm Tấm Sườn	45000.00	1	2026-03-16 15:06:00.359089
256	190	20	Pizza Margherita	125000.00	3	2026-03-16 15:06:00.359089
257	192	19	Cơm Tấm Sườn	45000.00	4	2026-03-16 15:07:03.04074
258	194	20	Pizza Margherita	125000.00	2	2026-03-16 15:08:29.685914
259	196	22	Phở bò tái	50000.00	2	2026-03-17 10:06:48.554514
260	196	24	quẩy	10000.00	3	2026-03-17 10:06:48.554514
261	198	19	Cơm Tấm Sườn	45000.00	2	2026-03-17 15:48:10.328184
262	198	20	Pizza Margherita	125000.00	2	2026-03-17 15:48:10.328184
263	200	11	Cơm Tấm Bì Chả	40000.00	1	2026-03-18 09:48:04.545962
264	200	12	Nước Ngọt	15000.00	1	2026-03-18 09:48:04.545962
265	202	25	Thăn bò nướng kiểu Hàn Quốc	450000.00	1	2026-03-18 16:08:26.661865
266	202	26	Bánh mì	10000.00	8	2026-03-18 16:08:26.661865
267	204	22	Phở bò tái	50000.00	1	2026-03-19 15:13:06.86139
268	204	24	quẩy	10000.00	4	2026-03-19 15:13:06.86139
269	206	22	Phở bò tái	50000.00	3	2026-03-19 15:14:55.640819
270	206	24	quẩy	10000.00	3	2026-03-19 15:14:55.640819
271	208	22	Phở bò tái	50000.00	2	2026-03-20 13:25:24.558599
272	208	24	quẩy	10000.00	3	2026-03-20 13:25:24.558599
273	210	22	Phở bò tái	50000.00	1	2026-03-21 13:00:27.768072
274	210	24	quẩy	10000.00	2	2026-03-21 13:00:27.768072
275	212	22	Phở bò tái	50000.00	3	2026-03-22 17:32:48.587633
276	212	24	quẩy	10000.00	4	2026-03-22 17:32:48.587633
277	214	22	Phở bò tái	50000.00	3	2026-03-23 16:48:02.533009
278	214	24	quẩy	10000.00	3	2026-03-23 16:48:02.533009
279	216	22	Phở bò tái	50000.00	1	2026-03-24 13:58:08.911211
280	216	24	quẩy	10000.00	1	2026-03-24 13:58:08.911211
281	216	28	Cơm chiên thập cẩm	45000.00	3	2026-03-24 13:58:08.911211
282	218	19	Cơm Tấm Sườn	45000.00	1	2026-03-24 15:11:18.465007
283	218	20	Pizza Margherita	125000.00	1	2026-03-24 15:11:18.465007
284	220	22	Phở bò tái	50000.00	1	2026-03-24 16:23:39.590223
285	220	24	quẩy	10000.00	3	2026-03-24 16:23:39.590223
286	220	28	Cơm chiên thập cẩm	45000.00	1	2026-03-24 16:23:39.590223
287	222	27	canh măng nấu vịt	35000.00	3	2026-03-26 09:43:52.077243
288	224	25	Thăn bò nướng kiểu Hàn Quốc	450000.00	1	2026-03-26 10:41:54.242215
289	224	26	Bánh mì	10000.00	5	2026-03-26 10:41:54.242215
290	224	27	canh măng nấu vịt	35000.00	5	2026-03-26 10:41:54.242215
291	226	25	Thăn bò nướng kiểu Hàn Quốc	450000.00	1	2026-03-26 10:41:56.423491
292	226	26	Bánh mì	10000.00	5	2026-03-26 10:41:56.423491
293	226	27	canh măng nấu vịt	35000.00	5	2026-03-26 10:41:56.423491
294	228	26	Bánh mì	10000.00	5	2026-03-28 14:15:56.363198
295	228	27	canh măng nấu vịt	35000.00	2	2026-03-28 14:15:56.363198
296	230	19	Cơm Tấm Sườn	45000.00	2	2026-03-30 13:37:25.427718
297	230	20	Pizza Margherita	125000.00	3	2026-03-30 13:37:25.427718
298	232	19	Cơm Tấm Sườn	45000.00	2	2026-03-31 11:09:41.352398
299	232	20	Pizza Margherita	125000.00	2	2026-03-31 11:09:41.352398
300	234	22	Phở bò tái	50000.00	4	2026-04-02 10:59:17.113339
301	234	24	quẩy	10000.00	2	2026-04-02 10:59:17.113339
302	236	19	Cơm Tấm Sườn	45000.00	3	2026-04-02 15:54:09.7856
303	236	20	Pizza Margherita	125000.00	2	2026-04-02 15:54:09.7856
304	238	22	Phở bò tái	50000.00	2	2026-04-02 17:10:41.028538
305	238	24	quẩy	10000.00	2	2026-04-02 17:10:41.028538
306	240	22	Phở bò tái	50000.00	2	2026-04-05 13:17:50.353598
\.


--
-- TOC entry 5067 (class 0 OID 271328)
-- Dependencies: 226
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_code, user_id, restaurant_id, user_name, user_phone, delivery_address, total_amount, delivery_fee, order_status, payment_status, notes, created_at, updated_at, payment_method, coupon_id, coupon_code, discount_amount, original_total, delivery_latitude, delivery_longitude) FROM stdin;
192	ORD20260316-000193	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	200000.00	20000.00	pending	paid	12345	2026-03-16 15:07:03.04074	2026-03-16 15:07:03.061227	card	\N	\N	0.00	200000.00	\N	\N
166	ORD20260228-000167	2	29	Jack Frost	0912345678	Lý Thường Kiệt, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	300000.00	20000.00	pending	paid		2026-02-28 11:31:25.191347	2026-02-28 11:31:30.712189	card	1	PROMO2	80000.00	380000.00	\N	\N
168	ORD20260301-000169	2	29	Jack Frost	0912345678	Lý Thường Kiệt, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	255000.00	20000.00	pending	paid	để phía sau sảnh	2026-03-01 17:18:28.859528	2026-03-01 17:18:30.567989	card	1	PROMO2	80000.00	335000.00	\N	\N
170	ORD20260304-000171	16	29	March Fourth	0915235123	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	420000.00	20000.00	pending	paid	kcj	2026-03-04 14:08:25.247962	2026-03-04 14:08:29.371118	card	1	PROMO2	80000.00	500000.00	\N	\N
178	ORD20260314-000179	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	270000.00	20000.00	delivering	paid	hehehehhe	2026-03-14 13:51:10.306447	2026-03-16 15:07:52.955262	card	1	PROMO2	80000.00	350000.00	\N	\N
172	ORD20260307-000173	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	184000.00	20000.00	cancelled	pending	1234556	2026-03-07 14:24:14.895731	2026-03-14 14:14:45.454169	card	3	PROMO1	46000.00	230000.00	\N	\N
176	ORD20260313-000177	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	540000.00	20000.00	processing	paid	123123	2026-03-13 15:28:12.710126	2026-03-14 14:14:39.229922	card	3	PROMO1	50000.00	590000.00	\N	\N
222	ORD20260326-000223	2	32	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	485500.00	480500.00	cancelled	paid	test	2026-03-26 09:43:52.077243	2026-03-26 09:44:39.122211	card	5	FAST100	100000.00	585500.00	\N	\N
184	ORD20260315-000185	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	300000.00	20000.00	cancelled	paid	123456	2026-03-15 17:17:21.054896	2026-03-15 17:17:40.646975	card	1	PROMO2	80000.00	380000.00	\N	\N
198	ORD20260317-000199	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	288000.00	20000.00	delivering	paid	test new coupons	2026-03-17 15:48:10.328184	2026-03-17 15:52:11.684877	card	6	DEMO20	72000.00	360000.00	\N	\N
240	ORD20260405-000241	2	30	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	80500.00	15000.00	pending	paid		2026-04-05 13:17:50.353598	2026-04-05 13:17:50.43454	card	7	PHN30	34500.00	115000.00	21.030740	105.784807
204	ORD20260319-000205	2	30	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	156800.00	106000.00	cancelled	paid	123456	2026-03-19 15:13:06.86139	2026-03-19 15:14:08.302495	card	3	PROMO1	39200.00	196000.00	\N	\N
216	ORD20260324-000217	2	30	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	201000.00	106000.00	delivering	paid	test	2026-03-24 13:58:08.911211	2026-03-24 13:59:06.760811	card	5	FAST100	100000.00	301000.00	\N	\N
164	ORD20260225-000165	2	29	Jack Frost	0912345678	Lý Thường Kiệt, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	270000.00	20000.00	delivered	paid	25 tháng 2, 2026, 4 giờ 47	2026-02-25 16:47:19.393041	2026-02-25 16:47:21.579902	card	1	PROMO2	80000.00	350000.00	\N	\N
210	ORD20260321-000211	2	30	Jack Frost	0912345678	Đường Eco Lake View, Chung cư Eco Lake View, A, Phường Định Công, Hà Nội, 11717, Việt Nam	90400.00	43000.00	cancelled	pending		2026-03-21 13:00:27.768072	2026-03-24 15:40:35.254753	cash	6	DEMO20	22600.00	113000.00	\N	\N
228	ORD20260328-000229	24	32	March 28	0932626262	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	445125.00	473500.00	delivering	paid		2026-03-28 14:15:56.363198	2026-03-28 14:17:41.530331	card	9	BBQ25P	148375.00	593500.00	\N	\N
232	ORD20260331-000233	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	390400.00	148000.00	pending	paid	123	2026-03-31 11:09:41.352398	2026-03-31 11:09:41.414971	card	6	DEMO20	97600.00	488000.00	21.009601	105.534910
234	ORD20260402-000235	2	30	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	228200.00	106000.00	delivering	paid	kcj	2026-04-02 10:59:17.113339	2026-04-02 11:00:01.472981	card	7	PHN30	97800.00	326000.00	21.009486	105.535028
58	ORD20251104-000059	2	3	Jack Frost	0912345678	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	165000.00	20000.00	processing	paid		2025-11-04 16:40:03.52191	2025-11-04 16:40:03.601723	cash	\N	\N	0.00	165000.00	\N	\N
200	ORD20260318-000201	2	1	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	60000.00	20000.00	cancelled	refunded	nothinggg	2026-03-18 09:48:04.545962	2026-03-18 09:48:08.853858	card	6	DEMO20	15000.00	75000.00	\N	\N
160	ORD20260218-000161	2	29	Jack Frost	0912345678	Phố Phan Chu Trinh, Điện Biên, Phường Hàm Rồng, Tỉnh Thanh Hóa, 45000, Việt Nam	161000.00	20000.00	pending	paid		2026-02-18 14:05:56.70451	2026-02-18 14:05:58.858199	card	1	PROMO2	69000.00	230000.00	\N	\N
174	ORD20260307-000175	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	184000.00	20000.00	cancelled	refunded	1234556	2026-03-07 14:24:29.538214	2026-03-07 14:26:37.152041	card	3	PROMO1	46000.00	230000.00	\N	\N
224	ORD20260326-000225	2	32	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	866625.00	480500.00	cancelled	pending		2026-03-26 10:41:54.242215	2026-03-26 10:42:22.982298	cash	9	BBQ25P	288875.00	1155500.00	\N	\N
180	ORD20260314-000181	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	112000.00	20000.00	processing	paid		2026-03-14 14:21:20.422746	2026-03-14 14:21:33.505	card	3	PROMO1	28000.00	140000.00	\N	\N
188	ORD20260315-000189	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	585000.00	20000.00	delivering	paid		2026-03-15 17:18:19.165422	2026-03-15 17:20:12.31263	card	3	PROMO1	50000.00	635000.00	\N	\N
194	ORD20260316-000195	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	220000.00	20000.00	delivering	pending	231	2026-03-16 15:08:29.685914	2026-03-16 15:08:54.82657	cash	3	PROMO1	50000.00	270000.00	\N	\N
206	ORD20260319-000207	2	30	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	206000.00	106000.00	delivering	paid	phở không rau củ	2026-03-19 15:14:55.640819	2026-03-19 15:15:22.22771	card	1	PROMO2	80000.00	286000.00	\N	\N
226	ORD20260326-000227	2	32	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	866625.00	480500.00	delivering	pending		2026-03-26 10:41:56.423491	2026-03-26 10:44:24.036329	cash	9	BBQ25P	288875.00	1155500.00	\N	\N
212	ORD20260322-000213	2	30	Jack Frost	0912345678	Việt Á Tower, 9, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	164000.00	15000.00	cancelled	paid	123123	2026-03-22 17:32:48.587633	2026-03-24 09:48:55.086251	card	6	DEMO20	41000.00	205000.00	\N	\N
218	ORD20260324-000219	2	29	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	254400.00	148000.00	delivered	paid	test	2026-03-24 15:11:18.465007	2026-03-24 15:11:18.496551	card	6	DEMO20	63600.00	318000.00	\N	\N
104	ORD20260124-000105	2	29	Jack Frost	0912345678	Phòng khám Đa khoa Thu Cúc, Đường Eco Lake View, Phường Định Công, Hà Nội, 11717, Việt Nam	185000.00	20000.00	delivering	paid	ấcc	2026-01-24 10:02:15.97745	2026-03-24 15:13:20.963289	cash	\N	\N	0.00	185000.00	\N	\N
230	ORD20260330-000231	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	513000.00	148000.00	delivering	paid	123	2026-03-30 13:37:25.427718	2026-03-30 13:38:07.364395	card	5	FAST100	100000.00	613000.00	21.009490	105.535011
236	ORD20260402-000237	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	426400.00	148000.00	cancelled	paid	123456	2026-04-02 15:54:09.7856	2026-04-02 15:54:53.69533	card	6	DEMO20	106600.00	533000.00	21.009483	105.535016
60	ORD20251120-000061	2	1	Jack Frost	0912345678	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	140000.00	20000.00	processing	paid		2025-11-20 15:45:42.841176	2025-11-20 15:45:42.949433	cash	\N	\N	0.00	140000.00	\N	\N
28	ORD20250918-000029	2	2	Jack Frost	0947554629	216 Trần Phú, phường Lam Sơn, thành phố Thanh Hóa	5415000.00	15000.00	pending	pending	Giao giờ nghỉ trưa	2025-09-18 17:16:30.464816	2025-09-18 17:16:30.464816	cash	\N	\N	0.00	5415000.00	\N	\N
62	ORD20251203-000063	2	3	Jack Frost	0912345678	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	220000.00	20000.00	processing	paid	skywalker	2025-12-03 13:57:27.194161	2025-12-03 13:57:27.754411	cash	\N	\N	0.00	220000.00	\N	\N
64	ORD20251218-000065	2	2	Jack Frost	0947554629	216 Trần Phú, phường Lam Sơn, thành phố Thanh Hóa	5415000.00	15000.00	pending	pending	Giao giờ nghỉ trưa	2025-12-18 11:39:04.560376	2025-12-18 11:39:04.560376	cash	\N	\N	0.00	5415000.00	\N	\N
66	ORD20251218-000067	2	3	Jack Frost	0912345678	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	215000.00	20000.00	cancelled	refunded	test sau khi migrate database	2025-12-18 15:27:18.16781	2025-12-18 15:27:22.540385	cash	\N	\N	0.00	215000.00	\N	\N
40	ORD20250923-000041	2	1	Jack Frost	0912345678	Phường Định Công, Hà Nội, 11718, Việt Nam	180000.00	20000.00	cancelled	refunded		2025-09-23 03:10:49.900602	2025-09-23 03:10:56.36239	cash	\N	\N	0.00	180000.00	\N	\N
42	ORD20250923-000043	2	1	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	345000.00	20000.00	processing	paid	abcdefghiklmnopqrstuvwyz	2025-09-23 16:23:35.089958	2025-09-23 16:23:35.125733	cash	\N	\N	0.00	345000.00	\N	\N
44	ORD20250923-000045	2	2	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	995000.00	20000.00	processing	paid	cho nhiều sốt tương cà nhé.	2025-09-23 16:49:40.525041	2025-09-23 16:49:40.549897	cash	\N	\N	0.00	995000.00	\N	\N
46	ORD20250923-000047	2	1	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	185000.00	20000.00	processing	paid	hello	2025-09-23 17:27:15.493597	2025-09-23 17:27:15.506991	cash	\N	\N	0.00	185000.00	\N	\N
48	ORD20250923-000049	2	1	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	220000.00	20000.00	processing	paid		2025-09-23 17:51:19.248513	2025-09-23 17:51:19.2655	cash	\N	\N	0.00	220000.00	\N	\N
50	ORD20251001-000051	2	1	Jack Frost	0912345678	Tống Duy Tân, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	300000.00	20000.00	cancelled	refunded		2025-10-01 12:10:58.98218	2025-10-01 12:11:03.729459	cash	\N	\N	0.00	300000.00	\N	\N
52	ORD20251003-000053	2	3	Jack Frost	0912345678	Tống Duy Tân, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	255000.00	20000.00	processing	paid		2025-10-03 14:43:35.539465	2025-10-03 14:43:35.579763	cash	\N	\N	0.00	255000.00	\N	\N
54	ORD20251004-000055	2	3	Jack Frost	0912345678	BIDV, 7, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	140000.00	20000.00	cancelled	refunded	123123 ~~	2025-10-04 17:15:08.895383	2025-10-04 17:15:14.66202	cash	\N	\N	0.00	140000.00	\N	\N
56	ORD20251016-000057	2	3	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phường Bạch Mai, Hà Nội, 10999, Việt Nam	345000.00	20000.00	processing	paid		2025-10-16 13:46:32.236319	2025-10-16 13:46:32.289803	cash	\N	\N	0.00	345000.00	\N	\N
68	ORD20251219-000069	6	3	December 18	0911111112	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	150000.00	20000.00	cancelled	refunded	yoloooo	2025-12-19 14:38:41.297904	2025-12-19 14:39:42.746587	cash	\N	\N	0.00	150000.00	\N	\N
70	ORD20251222-000071	6	1	December 18	0911111112	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	185000.00	20000.00	processing	paid	12313123113	2025-12-22 16:27:54.136391	2025-12-22 16:27:54.216277	cash	\N	\N	0.00	185000.00	\N	\N
72	ORD20251222-000073	2	2	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	840000.00	20000.00	cancelled	refunded		2025-12-22 17:02:25.319468	2025-12-22 17:02:32.151753	cash	\N	\N	0.00	840000.00	\N	\N
74	ORD20251228-000075	2	1	Jack Frost	0912345678	Mandarin Garden 2, 99, Phố Tân Mai, Phường Tương Mai, Hà Nội, 11715, Việt Nam	340000.00	20000.00	cancelled	refunded	giao hàng trước cửa	2025-12-28 17:15:48.578687	2025-12-28 17:16:00.179703	cash	\N	\N	0.00	340000.00	\N	\N
76	ORD20251229-000077	2	2	Jack Frost	0912345678	Ngõ 41 Phố Vọng, Phường Bạch Mai, Hà Nội, 11618, Việt Nam	670000.00	20000.00	cancelled	refunded	vávasvavsav	2025-12-29 14:24:45.838253	2025-12-29 14:25:01.609653	cash	\N	\N	0.00	670000.00	\N	\N
78	ORD20260102-000079	2	3	Jack Frost	0912345678	Điện Biên, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	175000.00	20000.00	processing	paid	abcdebffff	2026-01-02 16:20:05.072466	2026-01-02 16:20:05.167709	cash	\N	\N	0.00	175000.00	\N	\N
80	ORD20260103-000081	2	1	Jack Frost	0912345678	Điện Biên, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	150000.00	20000.00	cancelled	refunded	avcdasdasdadsadasdadsad	2026-01-03 16:40:03.798809	2026-01-03 16:41:41.469728	cash	\N	\N	0.00	150000.00	\N	\N
82	ORD20260103-000083	2	3	Jack Frost	0912345678	Điện Biên, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	80000.00	20000.00	processing	paid	ádasdads	2026-01-03 16:44:10.972232	2026-01-03 16:44:11.012296	cash	\N	\N	0.00	80000.00	\N	\N
84	ORD20260105-000085	2	2	Jack Frost	0912345678	Tỉnh ủy Thanh Hóa, Lê Thế Long, Nhà Liên Sở, Ba Đình, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	585000.00	20000.00	processing	paid	giao trực tiếp tại cổng	2026-01-05 13:37:02.432272	2026-01-05 13:37:02.466641	cash	\N	\N	0.00	585000.00	\N	\N
86	ORD20260110-000087	2	1	Jack Frost	0912345678	Tống Duy Tân, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	205000.00	20000.00	processing	paid		2026-01-10 17:25:56.741319	2026-01-10 17:25:57.315401	cash	\N	\N	0.00	205000.00	\N	\N
88	ORD20260110-000089	2	3	Jack Frost	0912345678	Tống Duy Tân, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	240000.00	20000.00	cancelled	refunded		2026-01-10 17:26:49.102327	2026-01-10 17:26:53.974431	cash	\N	\N	0.00	240000.00	\N	\N
90	ORD20260110-000091	2	2	Jack Frost	0912345678	The Coffee House, 36, Ngõ 36 Duy Tân, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	380000.00	20000.00	processing	paid		2026-01-10 17:51:37.172789	2026-01-10 17:51:37.196857	cash	\N	\N	0.00	380000.00	\N	\N
92	ORD20260112-000093	2	3	Jack Frost	0912345678	The Coffee House, 36, Ngõ 36 Duy Tân, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	245000.00	20000.00	processing	paid	abcdef	2026-01-12 15:26:24.010466	2026-01-12 15:26:24.05733	cash	\N	\N	0.00	245000.00	\N	\N
94	ORD20260112-000095	2	2	Jack Frost	0912345678	VinFast, Đường Eco Lake View, Phường Định Công, Hà Nội, 11717, Việt Nam	755000.00	20000.00	cancelled	refunded	123	2026-01-12 19:10:27.305716	2026-01-12 19:12:44.219321	cash	\N	\N	0.00	755000.00	\N	\N
96	ORD20260117-000097	2	2	Jack Frost	0912345678	The Coffee House, 36, Ngõ 36 Duy Tân, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	550000.00	20000.00	processing	paid	123444	2026-01-17 17:09:00.575623	2026-01-17 17:09:00.605489	cash	\N	\N	0.00	550000.00	\N	\N
98	ORD20260117-000099	2	1	Jack Frost	0912345678	The Coffee House, 36, Ngõ 36 Duy Tân, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	220000.00	20000.00	processing	paid	111	2026-01-17 17:30:08.004148	2026-01-17 17:30:08.032579	cash	\N	\N	0.00	220000.00	\N	\N
100	ORD20260119-000101	2	1	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	135000.00	20000.00	processing	paid	zxcvbnm	2026-01-19 15:24:20.745388	2026-01-19 15:24:20.790212	cash	\N	\N	0.00	135000.00	\N	\N
102	ORD20260124-000103	2	29	Jack Frost	0912345678	216 Trần Phú	165000.00	15000.00	delivered	paid	\N	2026-01-24 09:35:28.041895	2026-01-24 09:35:28.041895	cash	\N	\N	0.00	165000.00	\N	\N
106	ORD20260125-000107	2	29	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	395000.00	20000.00	processing	paid	123456	2026-01-25 15:46:30.690526	2026-01-25 15:46:30.743765	cash	\N	\N	0.00	395000.00	\N	\N
108	ORD20260201-000109	2	29	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	350000.00	20000.00	processing	paid	13243565645432	2026-02-01 17:11:16.822168	2026-02-01 17:11:16.885814	cash	\N	\N	0.00	350000.00	\N	\N
110	ORD20260204-000111	2	29	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	230000.00	20000.00	processing	paid		2026-02-04 16:31:36.646052	2026-02-04 16:31:37.704156	cash	\N	\N	0.00	230000.00	\N	\N
112	ORD20260204-000113	2	29	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	185000.00	20000.00	pending	pending	test - payment 	2026-02-04 17:33:11.005581	2026-02-04 17:33:11.005581	cash	\N	\N	0.00	185000.00	\N	\N
114	ORD20260204-000115	2	29	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	185000.00	20000.00	pending	pending	test - payment 	2026-02-04 17:34:06.902178	2026-02-04 17:34:06.902178	cash	\N	\N	0.00	185000.00	\N	\N
116	ORD20260204-000117	2	29	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	185000.00	20000.00	cancelled	pending	test - payment 	2026-02-04 17:42:25.48283	2026-02-04 17:44:27.390991	cash	\N	\N	0.00	185000.00	\N	\N
118	ORD20260204-000119	2	29	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	185000.00	20000.00	pending	paid	paytest	2026-02-04 17:43:37.714199	2026-02-04 17:43:42.252936	cash	\N	\N	0.00	185000.00	\N	\N
120	ORD20260204-000121	2	2	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	215000.00	20000.00	pending	paid	test-payment	2026-02-04 17:48:09.353661	2026-02-04 17:48:17.630354	cash	\N	\N	0.00	215000.00	\N	\N
122	ORD20260204-000123	2	3	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	70000.00	20000.00	pending	paid		2026-02-04 18:21:58.612025	2026-02-04 18:22:04.397015	cash	\N	\N	0.00	70000.00	\N	\N
124	ORD20260204-000125	2	2	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	95000.00	20000.00	pending	paid	nước cam giao trước cổng	2026-02-04 18:26:14.561269	2026-02-04 18:26:19.469116	cash	\N	\N	0.00	95000.00	\N	\N
126	ORD20260205-000127	2	3	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	140000.00	20000.00	pending	pending	vui vẻ ko quạo	2026-02-05 15:31:19.58917	2026-02-05 15:31:19.58917	cash	\N	\N	0.00	140000.00	\N	\N
128	ORD20260205-000129	2	2	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	430000.00	20000.00	pending	paid		2026-02-05 15:32:10.030741	2026-02-05 15:32:20.276613	card	\N	\N	0.00	430000.00	\N	\N
130	ORD20260205-000131	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	350000.00	20000.00	pending	pending		2026-02-05 15:58:52.562049	2026-02-05 15:58:52.562049	cash	\N	\N	0.00	350000.00	\N	\N
132	ORD20260205-000133	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	350000.00	20000.00	pending	pending		2026-02-05 16:06:03.857367	2026-02-05 16:06:03.857367	card	\N	\N	0.00	350000.00	\N	\N
134	ORD20260205-000135	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	350000.00	20000.00	pending	pending		2026-02-05 16:49:49.629714	2026-02-05 16:49:49.629714	card	\N	\N	0.00	350000.00	\N	\N
136	ORD20260205-000137	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	350000.00	20000.00	pending	paid		2026-02-05 17:08:03.460249	2026-02-05 17:08:23.967648	card	\N	\N	0.00	350000.00	\N	\N
138	ORD20260205-000139	2	1	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	175000.00	20000.00	pending	pending	123132	2026-02-05 17:19:09.760741	2026-02-05 17:19:09.760741	card	\N	\N	0.00	175000.00	\N	\N
140	ORD20260207-000141	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	470000.00	20000.00	pending	pending		2026-02-07 11:46:47.363481	2026-02-07 11:46:47.363481	cash	\N	\N	0.00	470000.00	\N	\N
144	ORD20260207-000145	2	1	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	265000.00	20000.00	pending	pending		2026-02-07 16:41:34.520404	2026-02-07 16:41:34.520404	card	\N	\N	0.00	265000.00	\N	\N
146	ORD20260209-000147	2	1	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	280000.00	20000.00	pending	pending		2026-02-09 11:06:16.457536	2026-02-09 11:06:16.457536	card	\N	\N	0.00	280000.00	\N	\N
148	ORD20260209-000149	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	485000.00	20000.00	pending	pending	123456	2026-02-09 17:15:10.582449	2026-02-09 17:15:10.582449	card	\N	\N	0.00	485000.00	\N	\N
150	ORD20260218-000151	2	1	Jack Frost	0912345678	Phố Phan Chu Trinh, Điện Biên, Phường Hàm Rồng, Tỉnh Thanh Hóa, 45000, Việt Nam	135000.00	20000.00	pending	pending	giao trước cổng	2026-02-18 09:06:22.030862	2026-02-18 09:06:22.030862	card	\N	\N	0.00	135000.00	\N	\N
182	ORD20260314-000183	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	585000.00	20000.00	delivering	paid	1234456	2026-03-14 14:23:37.233915	2026-03-15 15:30:47.776618	card	3	PROMO1	50000.00	635000.00	\N	\N
162	ORD20260219-000163	2	1	Jack Frost	0912345678	Lý Thường Kiệt, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	270000.00	20000.00	cancelled	refunded	123123123	2026-02-19 14:40:44.829607	2026-02-19 14:41:12.392764	card	3	PROMO1	50000.00	320000.00	\N	\N
190	ORD20260316-000191	2	29	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phương Liệt, Phường Kim Liên, Hà Nội, 11412, Việt Nam	390000.00	20000.00	delivering	paid	123456	2026-03-16 15:06:00.359089	2026-03-16 15:07:39.271396	card	3	PROMO1	50000.00	440000.00	\N	\N
208	ORD20260320-000209	2	30	Jack Frost	0912345678	Ngách 41/27 Phố Vọng, Phường Bạch Mai, Hà Nội, 10999, Việt Nam	132800.00	36000.00	delivering	paid	avbavasdasc	2026-03-20 13:25:24.558599	2026-03-20 13:25:49.652673	card	6	DEMO20	33200.00	166000.00	\N	\N
196	ORD20260317-000197	2	30	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	120000.00	20000.00	delivering	paid	nhiều quẩy giùm em	2026-03-17 10:06:48.554514	2026-03-17 10:09:55.429952	card	3	PROMO1	30000.00	150000.00	\N	\N
202	ORD20260318-000203	2	32	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	808400.00	480500.00	delivering	paid	abcdedf	2026-03-18 16:08:26.661865	2026-03-18 16:09:58.966666	card	6	DEMO20	202100.00	1010500.00	\N	\N
142	ORD20260207-000143	2	29	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	680000.00	20000.00	cancelled	paid	12312312321313	2026-02-07 11:47:33.447766	2026-03-24 15:14:03.837709	card	\N	\N	0.00	680000.00	\N	\N
214	ORD20260323-000215	2	30	Jack Frost	0912345678	Việt Á Tower, 9, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	156000.00	15000.00	delivering	paid	123123	2026-03-23 16:48:02.533009	2026-03-24 09:48:53.10468	card	6	DEMO20	39000.00	195000.00	\N	\N
220	ORD20260324-000221	2	30	Jack Frost	0912345678	Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	184800.00	106000.00	pending	paid		2026-03-24 16:23:39.590223	2026-03-24 16:23:39.638108	card	3	PROMO1	46200.00	231000.00	\N	\N
238	ORD20260402-000239	2	30	Jack Frost	0912345678	FPT Software, Đường N15, Khu Công nghệ cao Hòa Lạc, Xã Hòa Lạc, Hà Nội, Việt Nam	180800.00	106000.00	pending	paid		2026-04-02 17:10:41.028538	2026-04-02 17:10:41.110679	card	3	PROMO1	45200.00	226000.00	21.009526	105.534987
\.


--
-- TOC entry 5068 (class 0 OID 476390)
-- Dependencies: 227
-- Data for Name: restaurant_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_locations (restaurant_id, longitude, latitude) FROM stdin;
29	105.886922	21.051145
1	105.780309	21.036460
2	105.803293	20.991685
3	105.849799	21.010008
4	105.849343	21.015614
20	105.809427	21.009679
21	105.782532	21.034431
22	105.774725	21.033027
23	105.785076	21.034852
24	105.780309	21.036460
25	105.785679	21.020245
26	105.803651	20.990166
27	105.789660	21.036435
28	105.805970	21.004546
30	105.782685	21.033232
31	105.810430	21.009551
34	105.784784	21.030415
32	105.750930	19.813510
35	105.798392	21.044072
\.


--
-- TOC entry 5059 (class 0 OID 98963)
-- Dependencies: 218
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurants (id, name, address, phone, image_url, description, delivery_fee, created_at, status, owner_id, email, updated_at, delivery_time_min, delivery_time_max, min_order_value, opening_time, closing_time, verification_status, rating, total_reviews, is_featured) FROM stdin;
4	Kem Tràng Tiền	123 Hai Bà Trưng, Hà Nội	0920007778	https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-4.jpg	Kem chuẩn vị Tràng Tiền	15000.00	2025-07-05 18:10:42.397029	active	\N	kemtrngtin-4@fastdeli.com	2026-03-23 16:35:39.840887	10	20	0.00	08:00:00	22:00:00	approved	0.00	0	f
3	Trà Sữa Golden	127 Hai Bà Trưng, Hà Nội	0903456789	https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-3.jpg	Trà sữa tươi ngon	10000.00	2025-07-05 18:10:42.397029	active	\N	trsagolden-3@fastdeli.com	2026-03-23 16:35:39.840887	15	25	0.00	08:00:00	22:00:00	approved	0.00	0	f
2	Pizza House	128 Nguyễn Xiển, Thanh Xuân, Hà Nội	0902345678	https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-2.jpg	Pizza Ý chính hiệu	20000.00	2025-07-05 18:10:42.397029	active	\N	pizzahouse-2@fastdeli.com	2026-03-23 16:35:39.840887	35	45	0.00	08:00:00	22:00:00	approved	0.00	0	t
20	Mì Vằn Thắn Gia Truyền	30 Nguyễn Ngọc Vũ, Trung Hòa, Hà Nội	0901111017	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Mì vằn thắn thơm ngon, nước lèo đậm vị	7000.00	2025-07-07 16:02:39.529065	active	\N	mvnthngiatruyn-20@fastdeli.com	2026-03-23 16:35:39.840887	20	25	0.00	08:00:00	22:00:00	approved	0.00	0	f
23	Chè Dừa Thái Lan	77 Trần Quốc Hoàn, Cầu Giấy, Hà Nội	0901111021	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Chè dừa Thái mát lạnh, ngọt dịu	6000.00	2025-07-07 16:02:39.529065	active	\N	chdathilan-23@fastdeli.com	2026-03-23 16:35:39.840887	15	25	0.00	08:00:00	22:00:00	approved	0.00	0	t
1	Quán Cơm Tấm Sài Gòn	63 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội	0901234567	https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-1.jpg	Cơm tấm ngon, giá rẻ	15000.00	2025-07-05 18:10:42.397029	active	\N	quncmtmsign-1@fastdeli.com	2026-03-23 17:08:34.161341	20	30	0.00	08:00:00	22:00:00	approved	5.00	1	t
21	Bánh Cuốn Nóng Gia Truyền	102 Trần Quốc Vượng, Cầu Giấy, Hà Nội	0901111019	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Bánh cuốn nóng nhân thịt truyền thống	5000.00	2025-07-07 16:02:39.529065	active	\N	bnhcunnnggiatruyn-21@fastdeli.com	2026-03-23 16:35:39.840887	15	20	0.00	08:00:00	22:00:00	approved	0.00	0	f
22	Nem Nướng Nha Trang	99 Nguyễn Hoàng, Nam Từ Liêm, Hà Nội	0901111020	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Nem nướng giòn, nước chấm đặc biệt	10000.00	2025-07-07 16:02:39.529065	active	\N	nemnngnhatrang-22@fastdeli.com	2026-03-23 16:35:39.840887	20	30	0.00	08:00:00	22:00:00	approved	0.00	0	f
24	Ốc Cay Sài Gòn	59 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội	0901111022	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Ốc cay chuẩn vị miền Nam	15000.00	2025-07-07 16:02:39.529065	active	\N	ccaysign-24@fastdeli.com	2026-03-23 16:35:39.840887	30	45	0.00	08:00:00	22:00:00	approved	0.00	0	f
25	Cơm Bình Dân 123	123 Nguyễn Khánh Toàn, Cầu Giấy, Hà Nội	0901111023	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Cơm bình dân ngon, rẻ, nhanh	5000.00	2025-07-07 16:02:39.529065	active	\N	cmbnhdn123-25@fastdeli.com	2026-03-23 16:35:39.840887	15	20	0.00	08:00:00	22:00:00	approved	0.00	0	f
26	Cháo Lươn Nghệ An	42 Nguyễn Xiển, Thanh Xuân, Hà Nội	0901111026	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Cháo lươn thơm, béo, cay nhẹ	8000.00	2025-07-07 16:02:39.529065	active	\N	cholnnghan-26@fastdeli.com	2026-03-23 16:35:39.840887	20	30	0.00	08:00:00	22:00:00	approved	0.00	0	f
27	Bánh Đa Cua Hải Phòng	29 Nguyễn Phong Sắc, Cầu Giấy, Hà Nội	0901111027	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Bánh đa cua đậm chất đất Cảng	10000.00	2025-07-07 16:02:39.529065	active	\N	bnhacuahiphng-27@fastdeli.com	2026-03-23 16:35:39.840887	25	30	0.00	08:00:00	22:00:00	approved	0.00	0	f
28	Cơm Tấm Sài Gòn 24h	24 Hoàng Đạo Thúy, Thanh Xuân, Hà Nội	0901111030	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Cơm tấm ngon, phục vụ cả ngày	7000.00	2025-07-07 16:02:39.529065	active	\N	cmtmsign24h-28@fastdeli.com	2026-03-23 16:35:39.840887	15	25	0.00	08:00:00	22:00:00	approved	0.00	0	t
31	Bún Chả Hương Liên	31 Lê Văn Lương, Thanh Xuân, Hà Nội	0901111015	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Nhà hàng demo cho supplier 15	10000.00	2026-01-17 16:16:00.569049	active	15	supplier3@fastdeli.com	2026-03-23 16:35:39.840887	15	25	0.00	08:00:00	22:00:00	approved	0.00	0	f
33	Chó Cao Bằng Bộ PC	120 P.Yên Lãng, Thịnh Quang, Đống Đa, Hà Nội 100000, Vietnam	0977665544	https://res.cloudinary.com/dpldznnma/image/upload/v1773825909/restaurants/restaurant_33.jpg	nằm ở chộ đó	12000.00	2026-03-18 16:23:15.799484	active	21	jake18032026@gmail.com	2026-03-23 16:35:39.840887	30	45	120000.00	08:00:00	22:00:00	approved	0.00	0	f
29	Nhà hàng Demo	29 Nguyễn Văn Cừ, Long Biên, Hà Nội	0901111013	https://res.cloudinary.com/dpldznnma/image/upload/v1773737518/restaurants/restaurant_29.jpg	Nhà hàng demo cho supplier 13	15000.00	2026-01-17 16:16:00.569049	active	13	supplier@fastdeli.com	2026-03-28 14:08:10.870623	20	30	0.00	08:00:00	22:00:00	approved	4.50	2	f
34	Hai mốt tháng ba	9 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội 100000, Vietnam	0921032026	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	.	10000.00	2026-03-21 12:41:44.328846	active	22	21032026@gmail.com	2026-03-30 11:03:27.366335	30	45	40000.00	08:00:00	22:00:00	approved	0.00	0	f
32	BBQ Jack	288 Nguyễn Trãi, P. Điện Biên, Thanh Hóa, Vietnam	0988776655	https://res.cloudinary.com/dpldznnma/image/upload/v1774856746/restaurants/restaurant_32.jpg	chuyên thịt bò, thịt nướng	20000.00	2026-03-18 12:12:38.570547	active	20	jack18032026@gmail.com	2026-03-30 14:45:52.593144	30	45	0.00	08:00:00	22:00:00	approved	4.50	2	f
35	Subject 30	62 Đ. Nguyễn Văn Huyên, Nghĩa Đô, Cầu Giấy, Hà Nội, Vietnam	0930032026	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	\N	0.00	2026-03-30 15:32:24.420429	active	27	jack30032004@gmail.com	2026-03-30 15:34:23.781415	30	45	0.00	08:00:00	22:00:00	approved	0.00	0	f
30	Phở Hà Nội	30 Trần Duy Hưng, Cầu Giấy, Hà Nội	0901111014	https://res.cloudinary.com/dpldznnma/image/upload/v1773715938/restaurants/restaurant_30.jpg	Nhà hàng demo cho supplier 14	12000.00	2026-01-17 16:16:00.569049	active	14	supplier2@fastdeli.com	2026-04-02 10:57:52.771331	25	35	0.00	08:00:00	22:00:00	approved	3.50	2	f
\.


--
-- TOC entry 5074 (class 0 OID 599478)
-- Dependencies: 233
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (review_id, user_id, restaurant_id, rating, comment, created_at, updated_at) FROM stdin;
2	2	1	5	ổn	2026-03-23 17:08:34.143775	2026-03-23 17:08:34.143775
3	2	29	4	chỉnh sửa 3 sao -> 4 sao	2026-03-24 15:10:07.109617	2026-03-26 09:06:04.710468
4	2	32	5	\N	2026-03-26 09:34:21.909146	2026-03-26 09:34:21.909146
5	23	29	5	test, acc Jake moi tao.	2026-03-28 14:08:10.843705	2026-03-28 14:08:10.843705
6	24	30	3	thử nghiệm đánh giá	2026-03-28 14:11:33.07569	2026-03-28 14:11:33.07569
7	24	32	4	123	2026-03-28 14:14:09.243451	2026-03-28 14:14:09.243451
1	2	30	4	ngon	2026-03-23 16:47:18.763228	2026-04-02 10:57:52.765812
\.


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 228
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupons_id_seq', 11, true);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 219
-- Name: food_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.food_categories_category_id_seq', 11, true);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 230
-- Name: food_nutrition_nutrition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.food_nutrition_nutrition_id_seq', 8, true);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 221
-- Name: foods_food_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.foods_food_id_seq', 29, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_items_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_order_item_id_seq', 306, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 241, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 217
-- Name: restaurants_restaurant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restaurants_restaurant_id_seq', 35, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 232
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 7, true);


--
-- TOC entry 4883 (class 2606 OID 533881)
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- TOC entry 4885 (class 2606 OID 533879)
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- TOC entry 4854 (class 2606 OID 98987)
-- Name: food_categories food_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_categories
    ADD CONSTRAINT food_categories_category_name_key UNIQUE (category_name);


--
-- TOC entry 4856 (class 2606 OID 98985)
-- Name: food_categories food_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_categories
    ADD CONSTRAINT food_categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4890 (class 2606 OID 574882)
-- Name: food_nutrition food_nutrition_food_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_nutrition
    ADD CONSTRAINT food_nutrition_food_id_key UNIQUE (food_id);


--
-- TOC entry 4892 (class 2606 OID 574880)
-- Name: food_nutrition food_nutrition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_nutrition
    ADD CONSTRAINT food_nutrition_pkey PRIMARY KEY (nutrition_id);


--
-- TOC entry 4859 (class 2606 OID 98999)
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (food_id);


--
-- TOC entry 4869 (class 2606 OID 99035)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- TOC entry 4877 (class 2606 OID 271342)
-- Name: orders orders_order_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_code_key UNIQUE (order_code);


--
-- TOC entry 4879 (class 2606 OID 271340)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 476394)
-- Name: restaurant_locations restaurant_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_locations
    ADD CONSTRAINT restaurant_locations_pkey PRIMARY KEY (restaurant_id);


--
-- TOC entry 4850 (class 2606 OID 419001)
-- Name: restaurants restaurants_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_email_key UNIQUE (email);


--
-- TOC entry 4852 (class 2606 OID 98978)
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 599487)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- TOC entry 4900 (class 2606 OID 599489)
-- Name: reviews uq_reviews_user_restaurant; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT uq_reviews_user_restaurant UNIQUE (user_id, restaurant_id);


--
-- TOC entry 4886 (class 1259 OID 533882)
-- Name: idx_coupons_code_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_code_active ON public.coupons USING btree (code) WHERE (is_active = true);


--
-- TOC entry 4887 (class 1259 OID 533883)
-- Name: idx_coupons_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_dates ON public.coupons USING btree (start_date, end_date);


--
-- TOC entry 4888 (class 1259 OID 607674)
-- Name: idx_coupons_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_restaurant_id ON public.coupons USING btree (restaurant_id);


--
-- TOC entry 4857 (class 1259 OID 377994)
-- Name: idx_food_categories_category_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_food_categories_category_name ON public.food_categories USING btree (category_name);


--
-- TOC entry 4893 (class 1259 OID 574888)
-- Name: idx_food_nutrition_food_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_food_nutrition_food_id ON public.food_nutrition USING btree (food_id);


--
-- TOC entry 4860 (class 1259 OID 377989)
-- Name: idx_foods_is_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_is_available ON public.foods USING btree (is_available) WHERE (is_available = true);


--
-- TOC entry 4861 (class 1259 OID 377993)
-- Name: idx_foods_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_is_featured ON public.foods USING btree (is_featured) WHERE (is_featured = true);


--
-- TOC entry 4862 (class 1259 OID 377990)
-- Name: idx_foods_primary_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_primary_category ON public.foods USING btree (primary_category_id) WHERE (primary_category_id IS NOT NULL);


--
-- TOC entry 4863 (class 1259 OID 99079)
-- Name: idx_foods_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_restaurant ON public.foods USING btree (restaurant_id);


--
-- TOC entry 4864 (class 1259 OID 377992)
-- Name: idx_foods_restaurant_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_restaurant_available ON public.foods USING btree (restaurant_id, is_available, primary_category_id);


--
-- TOC entry 4865 (class 1259 OID 377991)
-- Name: idx_foods_secondary_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_secondary_category ON public.foods USING btree (secondary_category_id) WHERE (secondary_category_id IS NOT NULL);


--
-- TOC entry 4866 (class 1259 OID 377995)
-- Name: idx_order_items_food_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_food_id ON public.order_items USING btree (food_id);


--
-- TOC entry 4867 (class 1259 OID 99083)
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- TOC entry 4870 (class 1259 OID 533891)
-- Name: idx_orders_coupon_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_coupon_id ON public.orders USING btree (coupon_id) WHERE (coupon_id IS NOT NULL);


--
-- TOC entry 4871 (class 1259 OID 377996)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- TOC entry 4872 (class 1259 OID 279526)
-- Name: idx_orders_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_restaurant ON public.orders USING btree (restaurant_id);


--
-- TOC entry 4873 (class 1259 OID 279527)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (order_status);


--
-- TOC entry 4874 (class 1259 OID 279525)
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- TOC entry 4875 (class 1259 OID 279528)
-- Name: idx_orders_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_status ON public.orders USING btree (user_id, order_status);


--
-- TOC entry 4844 (class 1259 OID 377986)
-- Name: idx_restaurants_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_created_at ON public.restaurants USING btree (created_at DESC);


--
-- TOC entry 4845 (class 1259 OID 419013)
-- Name: idx_restaurants_delivery_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_delivery_time ON public.restaurants USING btree (delivery_time_min, delivery_time_max);


--
-- TOC entry 4846 (class 1259 OID 476368)
-- Name: idx_restaurants_owner_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_owner_id ON public.restaurants USING btree (owner_id);


--
-- TOC entry 4847 (class 1259 OID 419010)
-- Name: idx_restaurants_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_status ON public.restaurants USING btree (status) WHERE ((status)::text = ANY ((ARRAY['active'::character varying, 'pending'::character varying])::text[]));


--
-- TOC entry 4848 (class 1259 OID 419014)
-- Name: idx_restaurants_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_status_created ON public.restaurants USING btree (status, created_at DESC);


--
-- TOC entry 4894 (class 1259 OID 599497)
-- Name: idx_reviews_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_created_at ON public.reviews USING btree (created_at DESC);


--
-- TOC entry 4895 (class 1259 OID 599495)
-- Name: idx_reviews_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_restaurant ON public.reviews USING btree (restaurant_id);


--
-- TOC entry 4896 (class 1259 OID 599496)
-- Name: idx_reviews_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_user ON public.reviews USING btree (user_id);


--
-- TOC entry 4911 (class 2620 OID 271350)
-- Name: orders trg_generate_order_code; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_generate_order_code BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_code();


--
-- TOC entry 4910 (class 2620 OID 419018)
-- Name: restaurants trg_restaurants_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_restaurants_updated_at();


--
-- TOC entry 4912 (class 2620 OID 574890)
-- Name: food_nutrition trigger_update_nutrition_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_nutrition_timestamp BEFORE UPDATE ON public.food_nutrition FOR EACH ROW EXECUTE FUNCTION public.update_nutrition_timestamp();


--
-- TOC entry 4908 (class 2606 OID 574883)
-- Name: food_nutrition food_nutrition_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_nutrition
    ADD CONSTRAINT food_nutrition_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(food_id) ON DELETE CASCADE;


--
-- TOC entry 4901 (class 2606 OID 99106)
-- Name: foods foods_primary_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_primary_category_id_fkey FOREIGN KEY (primary_category_id) REFERENCES public.food_categories(category_id);


--
-- TOC entry 4902 (class 2606 OID 271351)
-- Name: foods foods_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);


--
-- TOC entry 4903 (class 2606 OID 99111)
-- Name: foods foods_secondary_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_secondary_category_id_fkey FOREIGN KEY (secondary_category_id) REFERENCES public.food_categories(category_id);


--
-- TOC entry 4904 (class 2606 OID 99041)
-- Name: order_items order_items_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(food_id);


--
-- TOC entry 4905 (class 2606 OID 533885)
-- Name: orders orders_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- TOC entry 4906 (class 2606 OID 271356)
-- Name: orders orders_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);


--
-- TOC entry 4907 (class 2606 OID 476395)
-- Name: restaurant_locations restaurant_locations_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_locations
    ADD CONSTRAINT restaurant_locations_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4909 (class 2606 OID 599490)
-- Name: reviews reviews_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


-- Completed on 2026-04-07 09:34:17

--
-- PostgreSQL database dump complete
--

