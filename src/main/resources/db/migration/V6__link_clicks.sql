CREATE TABLE IF NOT EXISTS link_clicks (
                                           id           BIGSERIAL PRIMARY KEY,
                                           link_id      BIGINT NOT NULL,
                                           ts           TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip           VARCHAR(45),
    country      VARCHAR(2),
    region       VARCHAR(64),
    city         VARCHAR(128),
    user_agent   TEXT,
    device_type  VARCHAR(16),
    os           VARCHAR(64),
    browser      VARCHAR(64),
    referer      TEXT,
    accept_lang  VARCHAR(64),
    utm_source   VARCHAR(64),
    utm_medium   VARCHAR(64),
    utm_campaign VARCHAR(64),
    utm_term     VARCHAR(64),
    utm_content  VARCHAR(64)
    );

CREATE INDEX IF NOT EXISTS ix_link_clicks_link_ts ON link_clicks(link_id, ts DESC);
