CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT DEFAULT '📁',
  color TEXT DEFAULT '#E8E8E8',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  folder_id TEXT,
  hashtags TEXT DEFAULT '[]',
  pinned INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
INSERT OR IGNORE INTO folders VALUES 
('f1','study','📚','#FFD6A5', strftime('%s','now')*1000),
('f2','work','💼','#A0C4FF', strftime('%s','now')*1000),
('f3','personal','🌱','#B9FBC0', strftime('%s','now')*1000),
('f4','ideas','💡','#FFFFB5', strftime('%s','now')*1000);
