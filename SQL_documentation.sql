CREATE TABLE character (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT NOT NULL REFERENCES "user"(id),
    ingame_name   VARCHAR(225) NOT NULL,
    level         INT NOT NULL DEFAULT 1,
    experience    INT NOT NULL DEFAULT 0,
    health        INT NOT NULL DEFAULT 100,
    attack        INT NOT NULL DEFAULT 0,
    critical      INT NOT NULL DEFAULT 0,
    speed         INT NOT NULL DEFAULT 0,
    defense       INT NOT NULL DEFAULT 0,
    evasion       INT NOT NULL DEFAULT 0,
    resistance    INT NOT NULL DEFAULT 0,
    luck          INT NOT NULL DEFAULT 0,
    stamina       INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),

    UNIQUE(user_id) -- one character per user; drop this if you want multiple characters per account
);

CREATE TABLE quest (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key           TEXT UNIQUE NOT NULL,
    title         TEXT NOT NULL,
    room          TEXT NOT NULL,
    difficulty    TEXT NOT NULL,
    rewards       JSONB NOT NULL   -- { "attack": 5, "speed": 2, "critical": 1 }
);

CREATE TABLE user_quest (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT NOT NULL REFERENCES "user"(id),
    quest_id      UUID NOT NULL REFERENCES quest(id),
    completed     BOOLEAN NOT NULL DEFAULT false,
    completed_at  TIMESTAMP,

    UNIQUE(user_id, quest_id)
);