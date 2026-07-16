import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      color TEXT DEFAULT '#1976d2',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS content_cards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT,
      brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
      brand_name TEXT,
      collection TEXT,
      product_name TEXT,
      product_url TEXT,
      platform TEXT,
      post_type TEXT,
      audience_name TEXT,
      audience_description TEXT,
      copy TEXT,
      hashtags TEXT,
      image_data TEXT,
      notes TEXT,
      status TEXT DEFAULT 'draft',
      date DATE,
      time TIME,
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audiences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      short_name TEXT NOT NULL UNIQUE,
      description TEXT,
      shopify_segment TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE content_cards ADD COLUMN IF NOT EXISTS flow_id UUID;
    ALTER TABLE content_cards ADD COLUMN IF NOT EXISTS flow_name TEXT;
    ALTER TABLE content_cards ADD COLUMN IF NOT EXISTS flow_step INT;
    ALTER TABLE content_cards ADD COLUMN IF NOT EXISTS flow_total INT;
    ALTER TABLE content_cards ADD COLUMN IF NOT EXISTS step_reason TEXT;
    ALTER TABLE content_cards ADD COLUMN IF NOT EXISTS stashed BOOLEAN DEFAULT false;
  `)
  console.log('DB tables ready')
}
