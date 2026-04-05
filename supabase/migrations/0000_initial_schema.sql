-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    language TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    family_friendly BOOLEAN NOT NULL DEFAULT false,
    has_parking BOOLEAN NOT NULL DEFAULT false,
    parking_slots INTEGER NOT NULL DEFAULT 0,
    artist TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}'
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    seats TEXT[] NOT NULL,
    total_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create parking_allocations table
CREATE TABLE parking_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    zone TEXT NOT NULL,
    slot_number INTEGER NOT NULL,
    vehicle_type TEXT NOT NULL,
    gate_hint TEXT NOT NULL,
    fee NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_allocations ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "Events are viewable by everyone." 
ON events FOR SELECT USING (true);

-- Policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" 
ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for parking allocations
CREATE POLICY "Users can view their own parking allocations" 
ON parking_allocations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own parking allocations" 
ON parking_allocations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert seed data for events
INSERT INTO events (id, title, description, category, date, time, venue, city, language, price, image, lat, lng, total_seats, available_seats, family_friendly, has_parking, parking_slots, artist, tags)
VALUES 
('10000000-0000-0000-0000-000000000001', 'Arijit Singh Live in Concert', 'Experience the magic of Arijit Singh live! An unforgettable evening of soulful melodies and chart-topping hits that will leave you spellbound.', 'Music', '2026-05-15', '19:00:00', 'Palace Grounds', 'Bengaluru', 'Hindi', 2500, '', 12.9981, 77.5722, 200, 142, true, true, 60, 'Arijit Singh', ARRAY['bollywood', 'live-music', 'concert']),
('20000000-0000-0000-0000-000000000002', 'Zakir Khan – Haq Se Single 4.0', 'India''s favourite stand-up comedian is back with a brand new hour! Get ready for relatable comedy, killer punchlines, and non-stop laughter.', 'Comedy', '2026-05-20', '20:00:00', 'Chowdiah Memorial Hall', 'Bengaluru', 'Hindi', 999, '', 12.9896, 77.5700, 150, 38, false, true, 40, 'Zakir Khan', ARRAY['standup', 'comedy', 'hindi']),
('30000000-0000-0000-0000-000000000003', 'Bengaluru Theatre Festival', 'A week-long celebration of performing arts featuring plays in Kannada, English, and Hindi. Multiple performances across iconic venues.', 'Theatre', '2026-06-01', '18:00:00', 'Ranga Shankara', 'Bengaluru', 'Kannada', 500, '', 12.9166, 77.6101, 100, 67, true, false, 0, NULL, ARRAY['theatre', 'kannada', 'arts', 'festival']),
('40000000-0000-0000-0000-000000000004', 'IPL Fan Park – RCB vs MI', 'Watch the biggest IPL rivalry on the giant screen! Food stalls, games, and an electric atmosphere. Wear your team colors!', 'Sports', '2026-05-10', '15:30:00', 'Cubbon Park Fan Zone', 'Bengaluru', 'English', 350, '', 12.9763, 77.5929, 500, 220, true, true, 80, NULL, ARRAY['ipl', 'cricket', 'sports', 'rcb']),
('50000000-0000-0000-0000-000000000005', 'Mumbai Electronic Music Festival', 'Three stages, 20+ artists, one unforgettable night. Featuring international and local DJs spinning everything from house to techno.', 'Music', '2026-06-15', '16:00:00', 'MMRDA Grounds', 'Mumbai', 'English', 3500, '', 19.0630, 72.8681, 1000, 580, false, true, 100, NULL, ARRAY['edm', 'electronic', 'festival', 'nightlife']),
('60000000-0000-0000-0000-000000000006', 'Pottery & Chai Workshop', 'Learn the art of pottery with expert guidance. Includes all materials, chai breaks, and you take home your creations!', 'Workshop', '2026-05-25', '10:00:00', 'The Clay Studio', 'Pune', 'English', 1200, '', 18.5204, 73.8567, 20, 8, true, false, 0, NULL, ARRAY['workshop', 'pottery', 'art', 'creative']),
('70000000-0000-0000-0000-000000000007', 'Delhi Street Food Festival', 'Explore 100+ stalls from across India. From chaat to dosa, biryani to momos — your ultimate foodie weekend awaits.', 'Food', '2026-06-08', '11:00:00', 'JLN Stadium Complex', 'Delhi', 'Hindi', 200, '', 28.5808, 77.2336, 2000, 1450, true, true, 120, NULL, ARRAY['food', 'festival', 'street-food', 'family']),
('80000000-0000-0000-0000-000000000008', 'React India Conference 2026', 'India''s premier React conference. Two days of talks, workshops, and networking with the best developers in the ecosystem.', 'Tech', '2026-07-12', '09:00:00', 'HICC', 'Hyderabad', 'English', 4000, '', 17.4854, 78.3806, 300, 195, true, true, 50, NULL, ARRAY['tech', 'react', 'conference', 'developer']);
