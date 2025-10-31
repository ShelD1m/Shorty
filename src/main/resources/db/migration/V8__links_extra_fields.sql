ALTER TABLE links
    ADD COLUMN IF NOT EXISTS user_id    BIGINT,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS max_clicks BIGINT,
    ADD COLUMN IF NOT EXISTS is_active  BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS ix_links_user ON links(user_id);
CREATE INDEX IF NOT EXISTS ix_links_expires_at ON links(expires_at);
