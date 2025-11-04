--
-- PostgreSQL database dump
--

\restrict KvREyCcEumbaiCzVP3ZMLaSBq7xjfa8xaI0YwTErAbIjYvyfJC5QY3GQgaboQth

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
-- Dumped by pg_dump version 17.6

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
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: flights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    term_id text NOT NULL,
    type text NOT NULL,
    airline text NOT NULL,
    flight_number text NOT NULL,
    departure_airport text NOT NULL,
    departure_date date NOT NULL,
    departure_time text NOT NULL,
    arrival_airport text NOT NULL,
    arrival_date date NOT NULL,
    arrival_time text NOT NULL,
    confirmation_code text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT flights_type_check CHECK ((type = ANY (ARRAY['outbound'::text, 'return'::text])))
);


ALTER TABLE public.flights OWNER TO postgres;

--
-- Name: not_travelling; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.not_travelling (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    term_id text NOT NULL,
    no_flights boolean DEFAULT false,
    no_transport boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.not_travelling OWNER TO postgres;

--
-- Name: service_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone_number text NOT NULL,
    license_number text,
    vehicle_type text NOT NULL,
    email text,
    notes text,
    rating integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT service_providers_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT service_providers_vehicle_type_check CHECK ((vehicle_type = ANY (ARRAY['school-coach'::text, 'taxi'::text])))
);


ALTER TABLE public.service_providers OWNER TO postgres;

--
-- Name: transport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    term_id text NOT NULL,
    type text NOT NULL,
    direction text NOT NULL,
    driver_name text NOT NULL,
    phone_number text NOT NULL,
    license_number text NOT NULL,
    pickup_time text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transport_direction_check CHECK ((direction = ANY (ARRAY['outbound'::text, 'return'::text])))
);


ALTER TABLE public.transport OWNER TO postgres;

--
-- Name: COLUMN transport.direction; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport.direction IS 'Direction of travel: outbound (from school) or return (to school)';


--
-- Data for Name: flights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flights (id, term_id, type, airline, flight_number, departure_airport, departure_date, departure_time, arrival_airport, arrival_date, arrival_time, confirmation_code, notes, created_at, updated_at) FROM stdin;
708e93ff-4daa-4b0f-8a58-307288959d52	wyc-autumn-2025	outbound	Cathay Pacific	CX239	HKG T1	2025-08-20	11:05	LHR T3	2025-08-20	17:30	6NYX8V	\N	2025-08-15 12:49:20.31731+00	2025-08-15 12:49:20.31731+00
c81131b2-ebbd-492d-a7a8-778ee69f3a6f	ben-autumn-2025	outbound	Cathay Pacific	CX239	HKG T1	2025-08-20	11:05	LHR T3	2025-08-20	17:30	6C9VHJ	\N	2025-08-14 10:07:24.92495+00	2025-08-16 10:13:57.786492+00
178f1c15-7848-4799-88a1-52935a6cf333	wyc-autumn-long-2025	outbound	Cathay Pacific	CX254	LHT T3	2025-10-17	22:15	HKG T1	2025-10-17	18:00	DBCUVH	\N	2025-08-18 22:30:31.983749+00	2025-08-19 00:56:43.064323+00
a27e52e9-6f80-4ee4-9d93-a9435ce0c43c	ben-autumn-half-2025	outbound	Cathay Pacific	CX254	LHR T3	2025-10-17	22:15	HKG T1	2025-10-17	18:00	DBFDBK	Weiyang 69H, Charlotte 70H reserved 	2025-08-15 12:51:33.758266+00	2025-10-02 01:12:47.709418+00
41f61a73-32f0-4e34-a965-e76a5ea40aa6	ben-autumn-half-2025	return	Cathay Pacific	CX255	HKG T1	2025-11-01	23:35	LHR T3	2025-11-02	06:20	66LUNZ	Weiyang 69H, Charlotte 70H reserved 	2025-08-15 09:04:57.547769+00	2025-09-27 02:03:47.817589+00
61517378-3135-4f6b-b344-121d03297f72	wyc-autumn-long-2025	return	Cathay Pacific	CX255	HKG T1	2025-11-01	23:35	LHR T3	2025-11-02	06:20	DBCUVH	\N	2025-08-18 22:22:04.045724+00	2025-08-19 00:57:12.753599+00
5cabfde9-53fb-441b-a5f1-e57500e57975	wyc-christmas-2025	outbound	Cathay Pacific	CX256	LHR T3	2025-12-10	20:10	HKG T1	2026-07-05	15:45	EFKDSB	\N	2025-08-14 10:40:53.344408+00	2025-08-15 14:03:23.303124+00
8fc90a17-fafa-4f0b-8caf-59a95e02e51e	ben-christmas-2025	outbound	Cathay Pacific	CX256	LHR T3	2025-12-10	20:10	HKG T1	2026-07-05	15:45	EFMJ37	12/10 London to HK CX256, Charlotte 40H, Weiyang 40G\n1/5 HK to London CX251: Charlotte 70H, UM (Peter Li) \n1/4 HK to London CX255 Weiyang 39G\n\nCharlotte TICKET number 160 2122222548\nLi Weiyang BOOKING REF EFMJ37	2025-08-14 10:39:37.79461+00	2025-09-27 04:07:57.498157+00
9391a3b9-5184-45e8-a0e0-a3e6c1aa836c	ben-spring-2026	return	Cathay Pacific	CX251	HKG T1	2026-01-04	22:40	LHR T3	2026-04-21	05:40	EFMJ37	\N	2025-08-14 10:42:06.541524+00	2025-08-17 00:21:27.241685+00
a4b95c33-53f8-4b49-a148-f26061a4e4a5	wyc-spring-2026	outbound	Cathay Pacific	CX255	HKG T1	2026-01-05	23:35	LHR T3	2025-11-02	06:20	EFKDSB	\N	2025-08-14 10:43:02.244044+00	2025-08-15 09:04:50.874156+00
254bd868-a94b-451e-bc35-5e779bd273c5	ben-spring-half-2026	outbound	Cathay Pacific	CX250	LHR T3	2026-02-13	17:50	HKG T1	2026-02-14	14:35	56V2UP	\N	2025-08-14 10:46:37.571799+00	2025-09-20 04:41:15.716088+00
24905fbd-3e30-43c3-9855-bcf16a211e85	wyc-spring-long-2026	outbound	Cathay Pacific	CX250	LHR T3	2026-02-13	17:50	HKG T1	2026-03-27	14:35	56V2UP	\N	2025-08-14 10:47:33.211174+00	2025-08-15 13:32:47.142763+00
c592a46c-676c-40c0-9397-fc2d55bb7a2e	wyc-spring-long-2026	return	Cathay Pacific	CX251	HKG T1	2026-02-21	22:40	LHR T3	2026-04-21	05:40	5LTE4A	\N	2025-08-14 11:14:00.674195+00	2025-08-17 00:21:29.027645+00
7914f122-dc06-426d-90d6-1a52fd4faf7c	ben-spring-half-2026	return	Cathay Pacific	CX251	HKG T1	2026-02-21	22:40	LHR T3	2026-04-21	05:40	5LTE4A	\N	2025-08-14 11:13:19.304719+00	2025-08-17 00:21:28.405058+00
071cff09-c831-426c-9438-53751844b572	wyc-easter-2026	outbound	Cathay Pacific	CX250	LHR T3	2026-03-26	17:50	HKG T1	2026-03-27	14:35	FFTRKH	\N	2025-08-15 13:32:47.925915+00	2025-08-15 13:32:47.925915+00
05326f16-0ed4-4e07-8175-841fa3e287dc	ben-easter-2026	outbound	Finnair	AY1338	LHR T3	2026-03-27	18:10	HKG T1	2026-03-28	19:05	O44U7V	\N	2025-08-15 13:10:00.774268+00	2025-08-15 13:11:17.636397+00
e9dc52e6-ed29-452b-81d8-3ad07a9efe30	ben-summer-2026	outbound	Cathay Pacific	CX255	HKG T1	2026-04-19	23:15	LHR T3	2026-04-19	06:20	DBFDBzk	\N	2025-09-23 04:35:09.940533+00	2025-09-23 04:35:09.940533+00
612fb83e-224a-4abb-b374-1756928e6dbc	wyc-summer-2026	outbound	Cathay Pacific	CX251	HKG T1	2026-04-20	22:40	LHR T3	2026-04-21	05:40	FFSRVX	\N	2025-08-17 00:21:30.096484+00	2025-08-17 00:21:30.096484+00
e55a828d-e3c9-4cea-bdf7-5fdbc2b2977b	wyc-summer-long-2026	outbound	Cathay Pacific	CX256	LHR T3	2026-05-22	20:10	HKG T1	2026-07-05	15:45	FFWKDH	\N	2025-08-15 13:52:53.207738+00	2025-08-15 14:03:22.85739+00
8742f066-cc29-471b-87e0-bfeae10ee77b	ben-summer-half-2026	outbound	Cathay Pacific	CX256	LHR T3	2026-05-22	20:10	HKG T1	2026-07-05	15:45	FFWKDH	\N	2025-08-15 13:52:37.933858+00	2025-08-15 14:03:22.643503+00
43946e83-6985-47ec-a5e9-a56de02bd81c	wyc-summer-long-2026	return	Cathay Pacific	CX251	HKG T1	2026-05-30	22:40	LHR T3	2026-04-21	05:40	FFWKUN	\N	2025-08-15 13:48:02.608101+00	2025-08-17 00:21:31.405955+00
35558fbc-9bcd-434b-a7ab-cf222d38935a	ben-summer-half-2026	return	Cathay Pacific	CX251	HKG T1	2026-05-30	22:40	LHR T3	2026-04-21	05:40	FFWKUN	\N	2025-08-15 13:47:36.140735+00	2025-08-17 00:21:30.711077+00
f0faafcf-eefe-4d3f-84a7-f1337dbad671	wyc-summer-holiday-2026	outbound	Cathay Pacific	CX256	LHR T3	2026-06-26	20:10	HKG T1	2026-07-05	15:45	FFXRWX	\N	2025-08-15 13:57:07.084635+00	2025-08-15 14:03:23.480521+00
326ed377-1882-40c5-a71f-b128098b3d19	ben-summer-holiday-2026	outbound	Cathay Pacific	CX256	LHR T3	2026-07-04	20:10	HKG T1	2026-07-05	15:45	FFYEQO	\N	2025-08-15 14:03:24.399105+00	2025-08-15 14:03:24.399105+00
\.


--
-- Data for Name: not_travelling; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.not_travelling (id, term_id, no_flights, no_transport, created_at, updated_at) FROM stdin;
03c0c661-5b96-40bd-ad11-be89b5fc1d2e	ben-autumn-exeat-2025	t	f	2025-08-14 12:38:54.172143+00	2025-08-14 12:38:54.172143+00
3c2d881e-927f-4cae-a3b5-6384b75df1ee	wyc-autumn-short-2025	t	f	2025-08-14 13:09:18.516729+00	2025-08-14 13:09:18.516729+00
0aaee520-7a59-4caa-9343-f33fc3330bba	ben-nov-exeat-2025	t	f	2025-08-14 13:44:20.930574+00	2025-08-14 13:44:20.930574+00
62a1ba5a-5f30-4d06-a2fe-868ad722d366	wyc-nov-short-2025	t	f	2025-08-14 16:59:21.922394+00	2025-08-14 16:59:21.922394+00
f33b15ed-ad95-4b37-abe7-9854a06bfb08	wyc-jan-short-2026	t	f	2025-08-14 16:59:56.195827+00	2025-08-14 16:59:56.195827+00
5b5cda56-e1a5-48e8-bffa-f84d76bd17b0	wyc-mar-short-2026	t	f	2025-08-15 00:24:44.917854+00	2025-08-15 00:24:44.917854+00
6cb2a8e9-9ddc-462d-963b-6dcd9fe58829	ben-mar-exeat-2026	t	f	2025-08-15 02:39:22.58845+00	2025-08-15 02:39:22.58845+00
7c819dc7-d7f7-42a7-b7ec-c860dc8b0a28	ben-may-exeat-2026	t	f	2025-08-15 14:00:06.336274+00	2025-08-15 14:00:06.336274+00
eb246e44-ca45-4702-a44a-ac21811266d1	wyc-may-short-2026	t	f	2025-08-15 14:00:08.873332+00	2025-08-15 14:00:08.873332+00
7763efb9-86ae-465c-bab3-7090474fda19	ben-jun-exeat-2026	t	f	2025-08-15 14:00:28.112442+00	2025-08-15 14:00:28.112442+00
839009a5-7fb1-47fd-bfc7-1a2a4f24720b	wyc-jun-short-2026	t	f	2025-08-15 14:00:37.706594+00	2025-08-15 14:00:37.706594+00
243edd01-8395-461b-b32d-88bb0b5018f7	ben-jun-exeat-2027	t	f	2025-08-16 10:02:11.670089+00	2025-08-16 10:02:11.670089+00
c3980c62-8c50-4645-9c53-add5ded0b0db	wyc-jun-short-2027	t	f	2025-08-16 10:02:14.427948+00	2025-08-16 10:02:14.427948+00
28c441ed-16e5-42c4-a863-6020475afb29	ben-jan-exeat-2026	t	t	2025-08-14 13:57:32.186094+00	2025-09-27 02:04:00.377012+00
\.


--
-- Data for Name: service_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_providers (id, name, phone_number, license_number, vehicle_type, email, notes, rating, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transport (id, term_id, type, direction, driver_name, phone_number, license_number, pickup_time, notes, created_at, updated_at) FROM stdin;
e6f5f117-ef66-4cc8-98bb-2e9e00da5513	ben-autumn-2025	taxi	outbound	Peter Li Kwok Ming	+44 7956 310276	37531	10:00	\N	2025-08-14 12:45:26.103171+00	2025-09-30 15:47:25.393535+00
6faa7a51-9049-4196-a0de-0ffc622c8611	ben-autumn-exeat-2025	taxi	outbound	Peter Li Kwok Ming	+44 7956 310276	37531	16:30	\N	2025-09-06 07:22:38.89532+00	2025-09-30 15:47:25.393535+00
2053ff43-3899-4055-82db-7e2532a13b01	wyc-autumn-short-2025	taxi	outbound	Peter Li Kwok Ming	+44 7956 310276	37531	12:00	\N	2025-09-06 07:23:14.006077+00	2025-09-30 15:47:25.393535+00
9c657205-3218-4092-bf65-91c72729ec5c	wyc-autumn-short-2025	taxi	outbound	Peter Li Kwok Ming	+44 7956 310276	37531	16:30	\N	2025-09-06 07:23:26.53867+00	2025-09-30 15:47:25.393535+00
310009c4-4d70-4a8d-aecb-40e3d00a1c9d	wyc-autumn-2025	taxi	outbound	Peter Li Kwok Ming	+44 7956 310276	37531	09:00	\N	2025-09-06 07:24:38.33434+00	2025-09-30 15:47:25.393535+00
91b1a208-1105-4de2-ae6b-f0bba2f3c32a	ben-autumn-exeat-2025	taxi	outbound	Tommy	+44 7544 118964		12:30	\N	2025-09-06 07:09:44.481366+00	2025-09-30 15:47:25.393535+00
02a2c398-1d3b-4938-8091-70676923aa98	ben-autumn-half-2025	school-coach	outbound				12:30	\N	2025-09-30 14:28:02.64547+00	2025-09-30 15:47:25.393535+00
\.


--
-- Name: flights flights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT flights_pkey PRIMARY KEY (id);


--
-- Name: not_travelling not_travelling_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.not_travelling
    ADD CONSTRAINT not_travelling_pkey PRIMARY KEY (id);


--
-- Name: not_travelling not_travelling_term_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.not_travelling
    ADD CONSTRAINT not_travelling_term_id_key UNIQUE (term_id);


--
-- Name: service_providers service_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT service_providers_pkey PRIMARY KEY (id);


--
-- Name: transport transport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport
    ADD CONSTRAINT transport_pkey PRIMARY KEY (id);


--
-- Name: idx_service_providers_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_providers_is_active ON public.service_providers USING btree (is_active);


--
-- Name: idx_service_providers_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_providers_name ON public.service_providers USING btree (name);


--
-- Name: idx_service_providers_vehicle_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_providers_vehicle_type ON public.service_providers USING btree (vehicle_type);


--
-- Name: flights update_flights_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON public.flights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: not_travelling update_not_travelling_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_not_travelling_updated_at BEFORE UPDATE ON public.not_travelling FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_providers update_service_providers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: transport update_transport_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_transport_updated_at BEFORE UPDATE ON public.transport FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- PostgreSQL database dump complete
--

\unrestrict KvREyCcEumbaiCzVP3ZMLaSBq7xjfa8xaI0YwTErAbIjYvyfJC5QY3GQgaboQth

