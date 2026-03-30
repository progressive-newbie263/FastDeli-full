--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-03-18 15:50:00

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16559)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    phone_number character varying(15) NOT NULL,
    email character varying(100),
    password_hash character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    avatar_url character varying(255),
    date_of_birth date,
    gender character varying(10),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(50) DEFAULT 'customer'::character varying NOT NULL,
    CONSTRAINT check_user_role CHECK (((role)::text = ANY ((ARRAY['customer'::character varying, 'restaurant_owner'::character varying, 'admin'::character varying, 'driver'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16558)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4742 (class 2604 OID 16562)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4901 (class 0 OID 16559)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, phone_number, email, password_hash, full_name, avatar_url, date_of_birth, gender, is_active, created_at, updated_at, role) FROM stdin;
6	0911111112	18122025@gmail.com	$2a$10$vd/WW05psCkMvtfdzrL6Qez04IHTQeCI5dSISB.bciOHSFGPQPyHu	December 18	https://res.cloudinary.com/dpldznnma/image/upload/v1766047785/avatars/customers/user_6.jpg	2000-11-11	other	t	2025-12-18 15:37:25.521712	2025-12-18 15:37:25.521712	customer
2	0912345678	jack26032004@gmail.com	$2a$10$hXjbpZGKx8fTaVlE9ggYsuWEkYdsU4yunzMjaVrqIy38BIw9pmSi2	Jack Frost	https://res.cloudinary.com/dpldznnma/image/upload/v1767345565/avatars/customers/user_2.jpg	2000-01-01	male	t	2025-06-02 14:34:44.178926	2025-06-02 14:34:44.178926	customer
13	0901234567	supplier@fastdeli.com	$2b$10$TfqeRJX/nTrwpqRRtZZNs.mt7Ln0mxM5lz0vrk1wBrG1ztXekCM8q	Nhà hàng Demo	https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg	2001-01-01	male	t	2026-01-15 17:40:59.660394	2026-01-15 17:40:59.660394	restaurant_owner
14	0901234568	supplier2@fastdeli.com	$2b$10$6W1cQNY1Lou6VG/yirAtceqZusA0iVKd2OawKhefNYMy3ls5fOnNS	Phở Hà Nội	https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg	2002-02-02	female	t	2026-01-15 17:40:59.660394	2026-01-15 17:40:59.660394	restaurant_owner
15	0901234569	supplier3@fastdeli.com	$2b$10$bfhUNRAZHoiSuE.Piz2XKOyNaqvHwYHgrD1xUuYac0brQqPgd2v8m	Bún Chả Hương Liên	https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg	2003-03-03	male	t	2026-01-15 17:40:59.660394	2026-01-15 17:40:59.660394	restaurant_owner
16	0915235123	04032026@gmail.com	$2a$10$jD/vbU5qzGqKrqwJa7ejPuebaFHt9DgUxGa60plaQL31q7XmQbas.	March Fourth	https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg	2000-12-31	male	t	2026-03-04 11:18:19.527365	2026-03-04 11:18:19.527365	customer
3	0982345671	test0@gmail.com	$2a$10$6OMTk6SzN8NmIzC.ajriAetHXO/x06cf1qEYCBpw2hu2PgNlxtRIO	Test Zero	https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg	2004-11-20	male	t	2025-06-07 13:33:25.209443	2025-06-07 13:33:25.209443	customer
4	0925446767	july8th@gmail.com	$2a$10$5XnrwWoUWeJc3FmaJnz6Qe60T7XoiYiqXbZ3dKr11mmQSn1T5erbS	July Eight	https://res.cloudinary.com/dpldznnma/image/upload/v1751960919/avatars/customers/user_4.jpg	1997-12-31	female	t	2025-07-08 14:48:14.91079	2025-07-08 14:48:14.91079	customer
20	0988776655	jack18032026@gmail.com	$2a$10$URLbjtuHkMGaHYdbWTLzjOZxLi9U8hNslgIjCaLrJ36e471mDKSQu	Jack NV	https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg	1990-01-01	other	t	2026-03-18 12:12:38.489136	2026-03-18 12:12:38.489136	restaurant_owner
\.


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 20, true);


--
-- TOC entry 4750 (class 2606 OID 16573)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4752 (class 2606 OID 16571)
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 4754 (class 2606 OID 16569)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4748 (class 1259 OID 402607)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


-- Completed on 2026-03-18 15:50:00

--
-- PostgreSQL database dump complete
--

