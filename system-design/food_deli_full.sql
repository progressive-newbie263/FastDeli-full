--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-01-17 17:03:47

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
-- TOC entry 236 (class 1255 OID 271348)
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
-- TOC entry 235 (class 1255 OID 419017)
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
-- TOC entry 228 (class 1259 OID 99068)
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    banner_id integer NOT NULL,
    title character varying(200),
    subtitle character varying(500),
    image_url text NOT NULL,
    link_url character varying(255),
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 99067)
-- Name: banners_banner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banners_banner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banners_banner_id_seq OWNER TO postgres;

--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 227
-- Name: banners_banner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banners_banner_id_seq OWNED BY public.banners.banner_id;


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
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 219
-- Name: food_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.food_categories_category_id_seq OWNED BY public.food_categories.category_id;


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
-- TOC entry 5069 (class 0 OID 0)
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
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_items_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_order_item_id_seq OWNED BY public.order_items.order_item_id;


--
-- TOC entry 230 (class 1259 OID 271328)
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
    CONSTRAINT orders_order_status_check CHECK (((order_status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'delivering'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 271327)
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
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 229
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 234 (class 1259 OID 304142)
-- Name: promotion_restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_restaurants (
    id integer NOT NULL,
    promotion_id integer,
    restaurant_id integer
);


ALTER TABLE public.promotion_restaurants OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 304141)
-- Name: promotion_restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotion_restaurants_id_seq OWNER TO postgres;

--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 233
-- Name: promotion_restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_restaurants_id_seq OWNED BY public.promotion_restaurants.id;


--
-- TOC entry 232 (class 1259 OID 304129)
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    discount_type character varying(50) NOT NULL,
    discount_value numeric(10,2),
    min_order_value numeric(10,2) DEFAULT 0,
    max_discount_value numeric(10,2),
    applicable_days character varying(50),
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    is_platform boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url text DEFAULT 'https://res.cloudinary.com/dpldznnma/image/upload/v1759473578/discount-default.png'::text
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 304128)
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotions_id_seq OWNER TO postgres;

--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 231
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotions_id_seq OWNED BY public.promotions.id;


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
    rating numeric(3,2) DEFAULT 0,
    total_reviews integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    longitude numeric(9,6),
    latitude numeric(9,6),
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
    documents jsonb,
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
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN restaurants.owner_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurants.owner_id IS 'Foreign key tới users.user_id trong db-shared-deli - chủ sở hữu nhà hàng';


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN restaurants.verification_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurants.verification_status IS 'Trạng thái xác minh: pending, approved, rejected';


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN restaurants.documents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurants.documents IS 'Lưu trữ URLs và metadata của giấy tờ xác minh (business license, certificates, etc.)';


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
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 217
-- Name: restaurants_restaurant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurants_restaurant_id_seq OWNED BY public.restaurants.id;


--
-- TOC entry 226 (class 1259 OID 99047)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 99046)
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
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 225
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- TOC entry 4811 (class 2604 OID 99071)
-- Name: banners banner_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners ALTER COLUMN banner_id SET DEFAULT nextval('public.banners_banner_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 98983)
-- Name: food_categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_categories ALTER COLUMN category_id SET DEFAULT nextval('public.food_categories_category_id_seq'::regclass);


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
-- TOC entry 4815 (class 2604 OID 271331)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4827 (class 2604 OID 304145)
-- Name: promotion_restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_restaurants ALTER COLUMN id SET DEFAULT nextval('public.promotion_restaurants_id_seq'::regclass);


--
-- TOC entry 4821 (class 2604 OID 304132)
-- Name: promotions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions ALTER COLUMN id SET DEFAULT nextval('public.promotions_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 98966)
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_restaurant_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 99050)
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- TOC entry 5055 (class 0 OID 99068)
-- Dependencies: 228
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banners (banner_id, title, subtitle, image_url, link_url, is_active, sort_order, created_at) FROM stdin;
\.


--
-- TOC entry 5047 (class 0 OID 98980)
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
-- TOC entry 5049 (class 0 OID 98989)
-- Dependencies: 222
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.foods (food_id, restaurant_id, food_name, description, price, image_url, is_available, created_at, is_featured, primary_category_id, secondary_category_id) FROM stdin;
10	1	Cơm Tấm Sườn Nướng	Cơm tấm với sườn nướng thơm ngon	45000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	1	2
11	1	Cơm Tấm Bì Chả	Cơm tấm truyền thống với bì và chả	40000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	1	8
12	1	Nước Ngọt	Coca Cola, Pepsi, 7Up	15000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	6	\N
13	2	Pizza Margherita	Pizza cơ bản với phô mai và cà chua	120000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	5	8
14	2	Pizza Hải Sản	Pizza với tôm, mực, cua	180000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	5	8
15	2	Nước Cam Tươi	Nước cam vắt tươi	25000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	6	\N
16	3	Trà Sữa Truyền Thống	Trà sữa đài loan chính hiệu	30000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	6	8
17	3	Trà Sữa Matcha	Trà sữa vị matcha Nhật Bản	35000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	6	8
18	3	Bánh Flan	Bánh flan mềm mịn	20000.00	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHCva-afP1vczYjMkGUFt4QQ51zwKM2q3GcQ&s	t	2025-07-05 19:04:28.394305	f	7	\N
\.


--
-- TOC entry 5051 (class 0 OID 99028)
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
\.


--
-- TOC entry 5057 (class 0 OID 271328)
-- Dependencies: 230
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_code, user_id, restaurant_id, user_name, user_phone, delivery_address, total_amount, delivery_fee, order_status, payment_status, notes, created_at, updated_at) FROM stdin;
58	ORD20251104-000059	2	3	Jack Frost	0912345678	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	165000.00	20000.00	processing	paid		2025-11-04 16:40:03.52191	2025-11-04 16:40:03.601723
60	ORD20251120-000061	2	1	Jack Frost	0912345678	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	140000.00	20000.00	processing	paid		2025-11-20 15:45:42.841176	2025-11-20 15:45:42.949433
28	ORD20250918-000029	2	2	Jack Frost	0947554629	216 Trần Phú, phường Lam Sơn, thành phố Thanh Hóa	5415000.00	15000.00	pending	pending	Giao giờ nghỉ trưa	2025-09-18 17:16:30.464816	2025-09-18 17:16:30.464816
62	ORD20251203-000063	2	3	Jack Frost	0912345678	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	220000.00	20000.00	processing	paid	skywalker	2025-12-03 13:57:27.194161	2025-12-03 13:57:27.754411
64	ORD20251218-000065	2	2	Jack Frost	0947554629	216 Trần Phú, phường Lam Sơn, thành phố Thanh Hóa	5415000.00	15000.00	pending	pending	Giao giờ nghỉ trưa	2025-12-18 11:39:04.560376	2025-12-18 11:39:04.560376
66	ORD20251218-000067	2	3	Jack Frost	0912345678	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	215000.00	20000.00	cancelled	refunded	test sau khi migrate database	2025-12-18 15:27:18.16781	2025-12-18 15:27:22.540385
40	ORD20250923-000041	2	1	Jack Frost	0912345678	Phường Định Công, Hà Nội, 11718, Việt Nam	180000.00	20000.00	cancelled	refunded		2025-09-23 03:10:49.900602	2025-09-23 03:10:56.36239
42	ORD20250923-000043	2	1	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	345000.00	20000.00	processing	paid	abcdefghiklmnopqrstuvwyz	2025-09-23 16:23:35.089958	2025-09-23 16:23:35.125733
44	ORD20250923-000045	2	2	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	995000.00	20000.00	processing	paid	cho nhiều sốt tương cà nhé.	2025-09-23 16:49:40.525041	2025-09-23 16:49:40.549897
46	ORD20250923-000047	2	1	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	185000.00	20000.00	processing	paid	hello	2025-09-23 17:27:15.493597	2025-09-23 17:27:15.506991
48	ORD20250923-000049	2	1	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	220000.00	20000.00	processing	paid		2025-09-23 17:51:19.248513	2025-09-23 17:51:19.2655
50	ORD20251001-000051	2	1	Jack Frost	0912345678	Tống Duy Tân, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	300000.00	20000.00	cancelled	refunded		2025-10-01 12:10:58.98218	2025-10-01 12:11:03.729459
52	ORD20251003-000053	2	3	Jack Frost	0912345678	Tống Duy Tân, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	255000.00	20000.00	processing	paid		2025-10-03 14:43:35.539465	2025-10-03 14:43:35.579763
54	ORD20251004-000055	2	3	Jack Frost	0912345678	BIDV, 7, Phố Duy Tân, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	140000.00	20000.00	cancelled	refunded	123123 ~~	2025-10-04 17:15:08.895383	2025-10-04 17:15:14.66202
56	ORD20251016-000057	2	3	Jack Frost	0912345678	Cầu vượt Ngã tư Vọng, Phường Bạch Mai, Hà Nội, 10999, Việt Nam	345000.00	20000.00	processing	paid		2025-10-16 13:46:32.236319	2025-10-16 13:46:32.289803
68	ORD20251219-000069	6	3	December 18	0911111112	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	150000.00	20000.00	cancelled	refunded	yoloooo	2025-12-19 14:38:41.297904	2025-12-19 14:39:42.746587
70	ORD20251222-000071	6	1	December 18	0911111112	Công an phường Cầu Giấy, 1, Ngõ 84 Phố Trần Thái Tông, Phường Cầu Giấy, Hà Nội, 10192, Việt Nam	185000.00	20000.00	processing	paid	12313123113	2025-12-22 16:27:54.136391	2025-12-22 16:27:54.216277
72	ORD20251222-000073	2	2	Jack Frost	0912345678	Cà Phê Aha, 38, Phố Duy Tân, Dịch Vọng Hậu, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	840000.00	20000.00	cancelled	refunded		2025-12-22 17:02:25.319468	2025-12-22 17:02:32.151753
74	ORD20251228-000075	2	1	Jack Frost	0912345678	Mandarin Garden 2, 99, Phố Tân Mai, Phường Tương Mai, Hà Nội, 11715, Việt Nam	340000.00	20000.00	cancelled	refunded	giao hàng trước cửa	2025-12-28 17:15:48.578687	2025-12-28 17:16:00.179703
76	ORD20251229-000077	2	2	Jack Frost	0912345678	Ngõ 41 Phố Vọng, Phường Bạch Mai, Hà Nội, 11618, Việt Nam	670000.00	20000.00	cancelled	refunded	vávasvavsav	2025-12-29 14:24:45.838253	2025-12-29 14:25:01.609653
78	ORD20260102-000079	2	3	Jack Frost	0912345678	Điện Biên, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	175000.00	20000.00	processing	paid	abcdebffff	2026-01-02 16:20:05.072466	2026-01-02 16:20:05.167709
80	ORD20260103-000081	2	1	Jack Frost	0912345678	Điện Biên, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	150000.00	20000.00	cancelled	refunded	avcdasdasdadsadasdadsad	2026-01-03 16:40:03.798809	2026-01-03 16:41:41.469728
82	ORD20260103-000083	2	3	Jack Frost	0912345678	Điện Biên, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	80000.00	20000.00	processing	paid	ádasdads	2026-01-03 16:44:10.972232	2026-01-03 16:44:11.012296
84	ORD20260105-000085	2	2	Jack Frost	0912345678	Tỉnh ủy Thanh Hóa, Lê Thế Long, Nhà Liên Sở, Ba Đình, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	585000.00	20000.00	processing	paid	giao trực tiếp tại cổng	2026-01-05 13:37:02.432272	2026-01-05 13:37:02.466641
86	ORD20260110-000087	2	1	Jack Frost	0912345678	Tống Duy Tân, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	205000.00	20000.00	processing	paid		2026-01-10 17:25:56.741319	2026-01-10 17:25:57.315401
88	ORD20260110-000089	2	3	Jack Frost	0912345678	Tống Duy Tân, Lam Sơn, Phường Hạc Thành, Tỉnh Thanh Hóa, 45000, Việt Nam	240000.00	20000.00	cancelled	refunded		2026-01-10 17:26:49.102327	2026-01-10 17:26:53.974431
90	ORD20260110-000091	2	2	Jack Frost	0912345678	The Coffee House, 36, Ngõ 36 Duy Tân, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	380000.00	20000.00	processing	paid		2026-01-10 17:51:37.172789	2026-01-10 17:51:37.196857
92	ORD20260112-000093	2	3	Jack Frost	0912345678	The Coffee House, 36, Ngõ 36 Duy Tân, Phường Cầu Giấy, Hà Nội, 11314, Việt Nam	245000.00	20000.00	processing	paid	abcdef	2026-01-12 15:26:24.010466	2026-01-12 15:26:24.05733
94	ORD20260112-000095	2	2	Jack Frost	0912345678	VinFast, Đường Eco Lake View, Phường Định Công, Hà Nội, 11717, Việt Nam	755000.00	20000.00	cancelled	refunded	123	2026-01-12 19:10:27.305716	2026-01-12 19:12:44.219321
\.


--
-- TOC entry 5061 (class 0 OID 304142)
-- Dependencies: 234
-- Data for Name: promotion_restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_restaurants (id, promotion_id, restaurant_id) FROM stdin;
1	3	2
\.


--
-- TOC entry 5059 (class 0 OID 304129)
-- Dependencies: 232
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, title, description, discount_type, discount_value, min_order_value, max_discount_value, applicable_days, start_date, end_date, is_platform, is_active, created_at, image_url) FROM stdin;
2	Giảm 30% cho mọi đơn hàng trên 120k vào Chủ Nhật, tối đa lên đến 80k	Áp dụng cho tất cả đơn hàng từ 120k trở lên	percent	30.00	120000.00	80000.00	sun	2025-01-01 00:00:00	2026-12-31 00:00:00	t	t	2025-10-01 16:54:10.903594	https://res.cloudinary.com/dpldznnma/image/upload/v1759474865/discount-30-percent-thumbnail.png
3	Pizza House tặng 50k	Giảm trực tiếp 50k cho đơn từ 200k	flat	50000.00	200000.00	50000.00	mon-sun	2025-01-01 00:00:00	2025-12-31 00:00:00	f	t	2025-10-01 16:54:10.903594	https://res.cloudinary.com/dpldznnma/image/upload/v1759474814/discount-50k-thumbnail.png
1	Giảm 20% cho mọi đơn hàng trên 80k từ T2-T6, tối đa lên đến 50k	Áp dụng cho tất cả đơn hàng trên 80k	percent	20.00	80000.00	50000.00	mon-fri	2025-01-01 00:00:00	2026-12-31 00:00:00	t	t	2025-10-01 16:54:10.903594	https://res.cloudinary.com/dpldznnma/image/upload/v1759474862/discount-20-percent-thumbnail.png
4	⚠️ TEST ONLY: Giảm 99% (dummy)	Coupon này chỉ để test hiển thị, không dùng thật	percent	99.00	1.00	999999.00	mon-sun	2023-01-01 00:00:00	2024-12-31 00:00:00	t	t	2025-10-03 13:42:56.01604	https://res.cloudinary.com/dpldznnma/image/upload/v1759474917/discount-default-thumbnail.png
\.


--
-- TOC entry 5045 (class 0 OID 98963)
-- Dependencies: 218
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurants (id, name, address, phone, image_url, description, delivery_fee, rating, total_reviews, is_featured, created_at, longitude, latitude, status, owner_id, email, updated_at, delivery_time_min, delivery_time_max, min_order_value, opening_time, closing_time, verification_status, documents) FROM stdin;
4	Kem Tràng Tiền	123 Hai Bà Trưng, Hà Nội	0920007778	https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-4.jpg	Kem chuẩn vị Tràng Tiền	15000.00	4.60	752	f	2025-07-05 18:10:42.397029	\N	\N	active	\N	kemtrngtin-4@fastdeli.com	2026-01-17 15:32:19.782575	10	20	0.00	08:00:00	22:00:00	approved	\N
3	Trà Sữa Golden	127 Hai Bà Trưng, Hà Nội	0903456789	https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-3.jpg	Trà sữa tươi ngon	10000.00	4.70	2100	f	2025-07-05 18:10:42.397029	\N	\N	active	\N	trsagolden-3@fastdeli.com	2026-01-17 15:32:19.782575	15	25	0.00	08:00:00	22:00:00	approved	\N
1	Quán Cơm Tấm Sài Gòn	63 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội	0901234567	https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-1.jpg	Cơm tấm ngon, giá rẻ	15000.00	4.50	1250	t	2025-07-05 18:10:42.397029	\N	\N	active	\N	quncmtmsign-1@fastdeli.com	2026-01-17 15:32:19.782575	20	30	0.00	08:00:00	22:00:00	approved	\N
2	Pizza House	128 Nguyễn Xiển, Thanh Xuân, Hà Nội	0902345678	https://res.cloudinary.com/dpldznnma/avatars/restaurants/restaurant-2.jpg	Pizza Ý chính hiệu	20000.00	4.20	890	t	2025-07-05 18:10:42.397029	\N	\N	active	\N	pizzahouse-2@fastdeli.com	2026-01-17 15:32:19.782575	35	45	0.00	08:00:00	22:00:00	approved	\N
20	Mì Vằn Thắn Gia Truyền	30 Nguyễn Ngọc Vũ, Trung Hòa, Hà Nội	0901111017	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Mì vằn thắn thơm ngon, nước lèo đậm vị	7000.00	4.60	920	f	2025-07-07 16:02:39.529065	\N	\N	active	\N	mvnthngiatruyn-20@fastdeli.com	2026-01-17 15:32:19.782575	20	25	0.00	08:00:00	22:00:00	approved	\N
23	Chè Dừa Thái Lan	77 Trần Quốc Hoàn, Cầu Giấy, Hà Nội	0901111021	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Chè dừa Thái mát lạnh, ngọt dịu	6000.00	4.50	900	t	2025-07-07 16:02:39.529065	\N	\N	active	\N	chdathilan-23@fastdeli.com	2026-01-17 15:32:19.782575	15	25	0.00	08:00:00	22:00:00	approved	\N
21	Bánh Cuốn Nóng Gia Truyền	102 Trần Quốc Vượng, Cầu Giấy, Hà Nội	0901111019	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Bánh cuốn nóng nhân thịt truyền thống	5000.00	4.20	600	f	2025-07-07 16:02:39.529065	\N	\N	active	\N	bnhcunnnggiatruyn-21@fastdeli.com	2026-01-17 15:32:19.782575	15	20	0.00	08:00:00	22:00:00	approved	\N
22	Nem Nướng Nha Trang	99 Nguyễn Hoàng, Nam Từ Liêm, Hà Nội	0901111020	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Nem nướng giòn, nước chấm đặc biệt	10000.00	4.60	860	f	2025-07-07 16:02:39.529065	\N	\N	active	\N	nemnngnhatrang-22@fastdeli.com	2026-01-17 15:32:19.782575	20	30	0.00	08:00:00	22:00:00	approved	\N
24	Ốc Cay Sài Gòn	59 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội	0901111022	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Ốc cay chuẩn vị miền Nam	15000.00	4.30	720	f	2025-07-07 16:02:39.529065	\N	\N	active	\N	ccaysign-24@fastdeli.com	2026-01-17 15:32:19.782575	30	45	0.00	08:00:00	22:00:00	approved	\N
25	Cơm Bình Dân 123	123 Nguyễn Khánh Toàn, Cầu Giấy, Hà Nội	0901111023	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Cơm bình dân ngon, rẻ, nhanh	5000.00	4.40	840	f	2025-07-07 16:02:39.529065	\N	\N	active	\N	cmbnhdn123-25@fastdeli.com	2026-01-17 15:32:19.782575	15	20	0.00	08:00:00	22:00:00	approved	\N
26	Cháo Lươn Nghệ An	42 Nguyễn Xiển, Thanh Xuân, Hà Nội	0901111026	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Cháo lươn thơm, béo, cay nhẹ	8000.00	4.40	880	f	2025-07-07 16:02:39.529065	\N	\N	active	\N	cholnnghan-26@fastdeli.com	2026-01-17 15:32:19.782575	20	30	0.00	08:00:00	22:00:00	approved	\N
27	Bánh Đa Cua Hải Phòng	29 Nguyễn Phong Sắc, Cầu Giấy, Hà Nội	0901111027	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Bánh đa cua đậm chất đất Cảng	10000.00	4.50	810	f	2025-07-07 16:02:39.529065	\N	\N	active	\N	bnhacuahiphng-27@fastdeli.com	2026-01-17 15:32:19.782575	25	30	0.00	08:00:00	22:00:00	approved	\N
28	Cơm Tấm Sài Gòn 24h	24 Hoàng Đạo Thúy, Thanh Xuân, Hà Nội	0901111030	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Cơm tấm ngon, phục vụ cả ngày	7000.00	4.70	1080	t	2025-07-07 16:02:39.529065	\N	\N	active	\N	cmtmsign24h-28@fastdeli.com	2026-01-17 15:32:19.782575	15	25	0.00	08:00:00	22:00:00	approved	\N
29	Nhà hàng Demo 13	29 Nguyễn Văn Cừ, Long Biên, Hà Nội	0901111013	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Nhà hàng demo cho supplier 13	15000.00	0.00	0	f	2026-01-17 16:16:00.569049	\N	\N	active	13	restaurant-29@fastdeli.com	2026-01-17 16:16:00.569049	20	30	0.00	08:00:00	22:00:00	approved	\N
30	Nhà hàng Demo 14	30 Trần Duy Hưng, Cầu Giấy, Hà Nội	0901111014	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Nhà hàng demo cho supplier 14	12000.00	0.00	0	f	2026-01-17 16:16:00.569049	\N	\N	active	14	restaurant-30@fastdeli.com	2026-01-17 16:16:00.569049	25	35	0.00	08:00:00	22:00:00	approved	\N
31	Nhà hàng Demo 15	31 Lê Văn Lương, Thanh Xuân, Hà Nội	0901111015	https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg	Nhà hàng demo cho supplier 15	10000.00	0.00	0	f	2026-01-17 16:16:00.569049	\N	\N	active	15	restaurant-31@fastdeli.com	2026-01-17 16:16:00.569049	15	25	0.00	08:00:00	22:00:00	approved	\N
\.


--
-- TOC entry 5053 (class 0 OID 99047)
-- Dependencies: 226
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (review_id, order_id, user_id, restaurant_id, rating, comment, created_at) FROM stdin;
\.


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 227
-- Name: banners_banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banners_banner_id_seq', 1, false);


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 219
-- Name: food_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.food_categories_category_id_seq', 11, true);


--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 221
-- Name: foods_food_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.foods_food_id_seq', 18, true);


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_items_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_order_item_id_seq', 154, true);


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 229
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 95, true);


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 233
-- Name: promotion_restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_restaurants_id_seq', 1, true);


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 231
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotions_id_seq', 4, true);


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 217
-- Name: restaurants_restaurant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restaurants_restaurant_id_seq', 28, true);


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 225
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 1, false);


--
-- TOC entry 4872 (class 2606 OID 99078)
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (banner_id);


--
-- TOC entry 4850 (class 2606 OID 98987)
-- Name: food_categories food_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_categories
    ADD CONSTRAINT food_categories_category_name_key UNIQUE (category_name);


--
-- TOC entry 4852 (class 2606 OID 98985)
-- Name: food_categories food_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.food_categories
    ADD CONSTRAINT food_categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4855 (class 2606 OID 98999)
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (food_id);


--
-- TOC entry 4865 (class 2606 OID 99035)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- TOC entry 4880 (class 2606 OID 271342)
-- Name: orders orders_order_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_code_key UNIQUE (order_code);


--
-- TOC entry 4882 (class 2606 OID 271340)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4888 (class 2606 OID 304147)
-- Name: promotion_restaurants promotion_restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_restaurants
    ADD CONSTRAINT promotion_restaurants_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 304140)
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 4846 (class 2606 OID 419001)
-- Name: restaurants restaurants_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_email_key UNIQUE (email);


--
-- TOC entry 4848 (class 2606 OID 98978)
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 99056)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- TOC entry 4873 (class 1259 OID 377997)
-- Name: idx_banners_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banners_is_active ON public.banners USING btree (is_active, sort_order) WHERE (is_active = true);


--
-- TOC entry 4853 (class 1259 OID 377994)
-- Name: idx_food_categories_category_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_food_categories_category_name ON public.food_categories USING btree (category_name);


--
-- TOC entry 4856 (class 1259 OID 377989)
-- Name: idx_foods_is_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_is_available ON public.foods USING btree (is_available) WHERE (is_available = true);


--
-- TOC entry 4857 (class 1259 OID 377993)
-- Name: idx_foods_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_is_featured ON public.foods USING btree (is_featured) WHERE (is_featured = true);


--
-- TOC entry 4858 (class 1259 OID 377990)
-- Name: idx_foods_primary_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_primary_category ON public.foods USING btree (primary_category_id) WHERE (primary_category_id IS NOT NULL);


--
-- TOC entry 4859 (class 1259 OID 99079)
-- Name: idx_foods_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_restaurant ON public.foods USING btree (restaurant_id);


--
-- TOC entry 4860 (class 1259 OID 377992)
-- Name: idx_foods_restaurant_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_restaurant_available ON public.foods USING btree (restaurant_id, is_available, primary_category_id);


--
-- TOC entry 4861 (class 1259 OID 377991)
-- Name: idx_foods_secondary_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_foods_secondary_category ON public.foods USING btree (secondary_category_id) WHERE (secondary_category_id IS NOT NULL);


--
-- TOC entry 4862 (class 1259 OID 377995)
-- Name: idx_order_items_food_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_food_id ON public.order_items USING btree (food_id);


--
-- TOC entry 4863 (class 1259 OID 99083)
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- TOC entry 4874 (class 1259 OID 377996)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- TOC entry 4875 (class 1259 OID 279526)
-- Name: idx_orders_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_restaurant ON public.orders USING btree (restaurant_id);


--
-- TOC entry 4876 (class 1259 OID 279527)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (order_status);


--
-- TOC entry 4877 (class 1259 OID 279525)
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- TOC entry 4878 (class 1259 OID 279528)
-- Name: idx_orders_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_status ON public.orders USING btree (user_id, order_status);


--
-- TOC entry 4883 (class 1259 OID 377999)
-- Name: idx_promotions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_active ON public.promotions USING btree (is_active, is_platform);


--
-- TOC entry 4884 (class 1259 OID 377998)
-- Name: idx_promotions_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_dates ON public.promotions USING btree (start_date, end_date, is_active) WHERE (is_active = true);


--
-- TOC entry 4838 (class 1259 OID 377986)
-- Name: idx_restaurants_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_created_at ON public.restaurants USING btree (created_at DESC);


--
-- TOC entry 4839 (class 1259 OID 419013)
-- Name: idx_restaurants_delivery_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_delivery_time ON public.restaurants USING btree (delivery_time_min, delivery_time_max);


--
-- TOC entry 4840 (class 1259 OID 419015)
-- Name: idx_restaurants_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_featured ON public.restaurants USING btree (is_featured, status, rating DESC) WHERE ((is_featured = true) AND ((status)::text = 'active'::text));


--
-- TOC entry 4841 (class 1259 OID 476368)
-- Name: idx_restaurants_owner_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_owner_id ON public.restaurants USING btree (owner_id);


--
-- TOC entry 4842 (class 1259 OID 419016)
-- Name: idx_restaurants_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_rating ON public.restaurants USING btree (rating DESC, total_reviews DESC) WHERE ((status)::text = 'active'::text);


--
-- TOC entry 4843 (class 1259 OID 419010)
-- Name: idx_restaurants_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_status ON public.restaurants USING btree (status) WHERE ((status)::text = ANY ((ARRAY['active'::character varying, 'pending'::character varying])::text[]));


--
-- TOC entry 4844 (class 1259 OID 419014)
-- Name: idx_restaurants_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_status_created ON public.restaurants USING btree (status, created_at DESC);


--
-- TOC entry 4866 (class 1259 OID 377987)
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);


--
-- TOC entry 4867 (class 1259 OID 99084)
-- Name: idx_reviews_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_restaurant ON public.reviews USING btree (restaurant_id);


--
-- TOC entry 4868 (class 1259 OID 377988)
-- Name: idx_reviews_restaurant_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_restaurant_rating ON public.reviews USING btree (restaurant_id, rating);


--
-- TOC entry 4898 (class 2620 OID 271350)
-- Name: orders trg_generate_order_code; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_generate_order_code BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_code();


--
-- TOC entry 4897 (class 2620 OID 419018)
-- Name: restaurants trg_restaurants_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_restaurants_updated_at();


--
-- TOC entry 4889 (class 2606 OID 99106)
-- Name: foods foods_primary_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_primary_category_id_fkey FOREIGN KEY (primary_category_id) REFERENCES public.food_categories(category_id);


--
-- TOC entry 4890 (class 2606 OID 271351)
-- Name: foods foods_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);


--
-- TOC entry 4891 (class 2606 OID 99111)
-- Name: foods foods_secondary_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_secondary_category_id_fkey FOREIGN KEY (secondary_category_id) REFERENCES public.food_categories(category_id);


--
-- TOC entry 4892 (class 2606 OID 99041)
-- Name: order_items order_items_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(food_id);


--
-- TOC entry 4894 (class 2606 OID 271356)
-- Name: orders orders_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);


--
-- TOC entry 4895 (class 2606 OID 304148)
-- Name: promotion_restaurants promotion_restaurants_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_restaurants
    ADD CONSTRAINT promotion_restaurants_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- TOC entry 4896 (class 2606 OID 304153)
-- Name: promotion_restaurants promotion_restaurants_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_restaurants
    ADD CONSTRAINT promotion_restaurants_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4893 (class 2606 OID 99062)
-- Name: reviews reviews_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);


-- Completed on 2026-01-17 17:03:47

--
-- PostgreSQL database dump complete
--

