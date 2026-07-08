import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'okiscape',
  user: process.env.DB_USER ?? 'okiscape',
  password: process.env.DB_PASSWORD,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params)
}

export async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        scores JSONB NOT NULL DEFAULT '[]'::jsonb,
        banner TEXT,
        summary TEXT,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await client.query(`
      ALTER TABLE ratings ADD COLUMN IF NOT EXISTS summary TEXT;
    `)
    await client.query(`
      ALTER TABLE ratings ADD COLUMN IF NOT EXISTS tags TEXT[];
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS site_info (
        id INTEGER PRIMARY KEY DEFAULT 1,
        about JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT single_row CHECK (id = 1)
      );
    `)

    await client.query(`
      ALTER TABLE site_info ADD COLUMN IF NOT EXISTS about JSONB;
    `)

    await client.query(`
      ALTER TABLE site_info ADD COLUMN IF NOT EXISTS about_me_title TEXT;
      ALTER TABLE site_info ADD COLUMN IF NOT EXISTS about_me_aka TEXT;
      ALTER TABLE site_info ADD COLUMN IF NOT EXISTS about_me_description JSONB;
      ALTER TABLE site_info ADD COLUMN IF NOT EXISTS about_me_links JSONB;
    `)

    await client.query(`
      UPDATE site_info SET about = jsonb_build_object(
        'title', COALESCE(about_me_title, 'no-data'),
        'aka', COALESCE(about_me_aka, 'no-data'),
        'description', COALESCE(about_me_description, '["no-data"]'::jsonb),
        'links', COALESCE(about_me_links, '[{"href":"https://google.com/","name":"no-links-yet"}]'::jsonb)
      )
      WHERE id = 1 AND (about IS NULL OR about = '{}'::jsonb);
    `)

    await client.query(`
      INSERT INTO site_info (id, about)
      VALUES (1, jsonb_build_object(
        'title', 'no-data',
        'aka', 'no-data',
        'description', '["no-data"]'::jsonb,
        'links', '[{"href":"https://google.com/","name":"no-links-yet"}]'::jsonb
      ))
      ON CONFLICT (id) DO NOTHING;
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS shouts (
        id SERIAL PRIMARY KEY,
        model_name TEXT NOT NULL DEFAULT '',
        cosmetics TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await client.query(`
      ALTER TABLE shouts ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;
    `)
    await client.query(`
      ALTER TABLE shouts ADD COLUMN IF NOT EXISTS ip_address TEXT NOT NULL DEFAULT '';
    `)

    console.log('Database initialized')
  } finally {
    client.release()
  }
}

export default pool
