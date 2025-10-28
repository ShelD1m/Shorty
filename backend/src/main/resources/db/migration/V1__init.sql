create table if not exists users (
                                     id            bigserial primary key,
                                     email         varchar(255) not null unique,
    password_hash varchar(255) not null,
    role          varchar(32)  not null default 'USER',
    created_at    timestamptz  not null default now()
    );

create table if not exists links (
                                     id           bigserial primary key,
                                     user_id      bigint not null references users(id) on delete cascade,
    slug         varchar(32) not null unique,
    target_url   text not null,
    is_active    boolean not null default true,
    expires_at   timestamptz,
    max_clicks   bigint,
    clicks_count bigint not null default 0,
    created_at   timestamptz not null default now()
    );

create index if not exists idx_links_user on links(user_id);
create index if not exists idx_links_created on links(created_at);