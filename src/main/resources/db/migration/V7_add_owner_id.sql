ALTER TABLE links
    ADD COLUMN IF NOT EXISTS owner_id BIGINT;

CREATE INDEX IF NOT EXISTS ix_links_owner ON links(owner_id);