-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT, -- Lucide icon name or URL
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed Default Categories
INSERT INTO categories (name_ar, name_en, icon) VALUES
('برمجة وتطوير', 'Programming', 'Code'),
('تصميم وجرافيك', 'Design', 'Palette'),
('محاسبة ومالية', 'Accounting', 'Calculator'),
('مطاعم وضيافة', 'Restaurants', 'Utensils'),
('مبيعات وتسويق', 'Sales / Representatives', 'TrendingUp'),
('طب وصحة', 'Medical', 'Stethoscope'),
('هندسة', 'Engineering', 'HardHat'),
('أخرى', 'Other', 'MoreHorizontal')
ON CONFLICT DO NOTHING;

-- 3. Update Jobs Table to include new fields
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT 'Full-time',
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS salary_range TEXT;

-- 4. Enable RLS for Categories (Readable by everyone, Writable by Admin only if needed)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on categories"
ON categories FOR SELECT
TO public
USING (true);
