-- ==========================================================
-- РЯДОМ НСК — Полноценная схема БД Supabase / PostgreSQL (PostGIS)
-- Архитектура масштабируемого гиперлокального сервиса
-- ==========================================================

-- 1. Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Города (для масштабирования: Новосибирск, Бердск, Краснообск...)
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  center GEOMETRY(Point, 4326) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Районы
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  center GEOMETRY(Point, 4326) NOT NULL,
  boundary GEOMETRY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Категории
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- 'request', 'deal', 'event', 'announcement', 'alert', 'neighbor'
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  sort_order INT DEFAULT 0
);

-- 5. Профили пользователей (связано с auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- auth.uid()
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  avatar_url TEXT,
  role VARCHAR(30) DEFAULT 'user', -- 'user', 'executor', 'business', 'admin'
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  completed_orders_count INT DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  telegram_id BIGINT,
  city_id UUID REFERENCES cities(id),
  district_name VARCHAR(100) DEFAULT 'Октябрьский',
  last_location GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- ФЗ-152 compliance fields
  consent_version VARCHAR(20) DEFAULT '1.0.0',
  consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  consent_geo BOOLEAN DEFAULT FALSE,
  consent_analytics BOOLEAN DEFAULT FALSE,
  consent_marketing BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ, -- Soft delete for Art. 17 ФЗ-152
  data_export_requested BOOLEAN DEFAULT FALSE,
  data_export_requested_at TIMESTAMPTZ
);

-- 6. Бизнес-профили
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  phone VARCHAR(30),
  address TEXT,
  district_name VARCHAR(100) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  schedule VARCHAR(200),
  logo_url TEXT,
  photos TEXT[],
  rating NUMERIC(3, 2) DEFAULT 5.0,
  is_pro BOOLEAN DEFAULT FALSE,
  is_pro_plus BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Основная таблица публикаций
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'request', 'offer', 'deal', 'event', 'alert', 'neighbor'
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  district_name VARCHAR(100) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL, -- Приблизительные координаты для геопоиска
  approx_address VARCHAR(255),
  price NUMERIC(10, 2),
  original_price NUMERIC(10, 2),
  discount_percent INT,
  target_date VARCHAR(50),
  target_time VARCHAR(50),
  urgency VARCHAR(20) DEFAULT 'normal', -- 'high' (срочно), 'normal'
  status VARCHAR(30) DEFAULT 'active', -- 'active', 'completed', 'moderation', 'hidden'
  is_boosted BOOLEAN DEFAULT FALSE,
  boost_expires_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  responses_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  external_url TEXT,
  source VARCHAR(100) DEFAULT 'direct',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс PostGIS для мгновенного гиперлокального поиска ST_DWithin
CREATE INDEX IF NOT EXISTS posts_location_gist ON posts USING GIST (location);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts (status);
CREATE INDEX IF NOT EXISTS posts_type_idx ON posts (type);
CREATE INDEX IF NOT EXISTS posts_district_idx ON posts (district_name);

-- 8. Запросы («Нужно сейчас»)
CREATE TABLE IF NOT EXISTS requests (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  needed_by TIMESTAMPTZ,
  is_paid_urgent BOOLEAN DEFAULT FALSE
);

-- 9. Предложения и услуги («Я предлагаю»)
CREATE TABLE IF NOT EXISTS offers (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  service_type VARCHAR(100)
);

-- 10. События
CREATE TABLE IF NOT EXISTS events (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  event_date DATE,
  event_time TIME,
  venue_name VARCHAR(200),
  is_free BOOLEAN DEFAULT FALSE,
  ticket_url TEXT
);

-- 11. Важные предупреждения и ЧП
CREATE TABLE IF NOT EXISTS alerts (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL, -- авария, отключение воды, перекрытие и т.д.
  affected_area VARCHAR(200),
  resolved_at TIMESTAMPTZ
);

-- 12. Отклики исполнителей
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  offer_price NUMERIC(10, 2),
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Сохраненные публикации
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 14. Уведомления
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Отзывы и оценки
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Подписки (Бизнес PRO / PRO+)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL, -- 'pro', 'pro_plus'
  status VARCHAR(30) DEFAULT 'active',
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  amount_rub NUMERIC(10, 2)
);

-- 17. Продвижение (Boost)
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  boost_type VARCHAR(50) NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  amount_rub NUMERIC(10, 2)
);

-- 18. Пользовательские предпочтения и радиус
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT ARRAY['Скидки', 'Еда', 'Ремонт', 'Мероприятия'],
  radius_km NUMERIC(4, 1) DEFAULT 3.0,
  notification_categories TEXT[] DEFAULT ARRAY['urgent_request', 'deal', 'alert'],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Источники контента
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  url TEXT,
  source_type VARCHAR(50) DEFAULT 'public_api',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Импорт внешнего контента
CREATE TABLE IF NOT EXISTS imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  original_url TEXT,
  original_text TEXT,
  ai_parsed_json JSONB,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Жалобы пользователей
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'open', -- 'open', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Журнал модерации
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'approved', 'hidden', 'deleted', 'verified'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Чат между пользователями
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(150),
  sender_avatar TEXT,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_name VARCHAR(150),
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_post_idx ON chat_messages (post_id);
CREATE INDEX IF NOT EXISTS chat_recipient_idx ON chat_messages (recipient_id, is_read);

-- 24. Журнал аудита (ФЗ-152)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_id VARCHAR(100),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_user_idx ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_action_idx ON audit_logs (action);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POSTS
CREATE POLICY "Public posts viewable by everyone" ON posts FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- RESPONSES
CREATE POLICY "Public responses viewable" ON responses FOR SELECT USING (true);
CREATE POLICY "Users can create responses" ON responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Post owner can update responses" ON responses FOR UPDATE USING (auth.uid() IN (SELECT author_id FROM posts WHERE id = post_id));

-- SAVED POSTS
CREATE POLICY "Users manage own saved" ON saved_posts FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users mark own read" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- BUSINESSES
CREATE POLICY "Public businesses viewable" ON businesses FOR SELECT USING (true);
CREATE POLICY "Owners manage own business" ON businesses FOR ALL USING (auth.uid() = owner_id);

-- REVIEWS
CREATE POLICY "Public reviews viewable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = author_id);

-- REPORTS
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins view reports" ON reports FOR SELECT USING (true);

-- CHAT MESSAGES
CREATE POLICY "Participants can view chat" ON chat_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send chat" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can mark read" ON chat_messages FOR UPDATE USING (auth.uid() = recipient_id);

-- AUDIT LOGS
CREATE POLICY "System can insert audit" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view audit" ON audit_logs FOR SELECT USING (true);

-- ==========================================================
-- PostGIS Функция гиперлокальной выборки по радиусу
-- ==========================================================
CREATE OR REPLACE FUNCTION get_nearby_posts(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_meters INT DEFAULT 3000,
  post_type_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  type VARCHAR,
  title VARCHAR,
  category VARCHAR,
  price NUMERIC,
  urgency VARCHAR,
  district_name VARCHAR,
  distance_meters INT,
  is_boosted BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
AS $$
  SELECT 
    p.id,
    p.type,
    p.title,
    p.category,
    p.price,
    p.urgency,
    p.district_name,
    ROUND(ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography))::INT AS distance_meters,
    p.is_boosted,
    p.created_at
  FROM posts p
  WHERE p.status = 'active'
    AND ST_DWithin(p.location::geography, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius_meters)
    AND (post_type_filter IS NULL OR p.type = post_type_filter)
  ORDER BY 
    p.is_boosted DESC,
    (CASE WHEN p.urgency = 'high' THEN 1 ELSE 2 END) ASC,
    distance_meters ASC,
    p.created_at DESC;
$$;
