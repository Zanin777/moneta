CREATE TABLE IF NOT EXISTS valuation_history(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,entity_type TEXT NOT NULL CHECK(entity_type IN ('assets','liabilities')),entity_id TEXT NOT NULL,amount INTEGER NOT NULL CHECK(amount>=0),date TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(owner_id,entity_type,entity_id,date));
CREATE INDEX IF NOT EXISTS valuations_owner_date ON valuation_history(owner_id,date);
CREATE TABLE IF NOT EXISTS import_batches(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,payload_hash TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(owner_id,payload_hash));
INSERT OR IGNORE INTO valuation_history(id,owner_id,entity_type,entity_id,amount,date) SELECT 'asset-'||id,owner_id,'assets',id,amount,date FROM assets;
INSERT OR IGNORE INTO valuation_history(id,owner_id,entity_type,entity_id,amount,date) SELECT 'liability-'||id,owner_id,'liabilities',id,amount,date FROM liabilities;
INSERT OR IGNORE INTO schema_migrations(version) VALUES(2);
