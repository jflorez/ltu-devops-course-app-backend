CREATE TABLE Game (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    console VARCHAR(255),
    releaseDate DATE
);

CREATE TABLE User (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registeredAt DATE
);

CREATE TABLE Category (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE Speedrun (
    id CHAR(36) PRIMARY KEY,
    gameId CHAR(36),
    runnerId CHAR(36),
    time_ms DECIMAL(10, 2),
    date DATE,
    categoryId CHAR(36),
    FOREIGN KEY (gameId) REFERENCES Game(id),
    FOREIGN KEY (runnerId) REFERENCES User(id),
    FOREIGN KEY (categoryId) REFERENCES Category(id)
);

-- Sample Games
INSERT INTO Game (id, name, description, console, releaseDate) VALUES
    ('1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', 'Super Mario 64', 'Revolutionary 3D platformer', 'Nintendo 64', '1996-06-23'),
    ('2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 'The Legend of Zelda: Ocarina of Time', 'Action-adventure game', 'Nintendo 64', '1998-11-21'),
    ('3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', 'GoldenEye 007', 'First-person shooter', 'Nintendo 64', '1997-08-25');

-- Sample Users
INSERT INTO User (id, name, registeredAt) VALUES
    ('4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', 'SpeedDemon', '2020-01-15'),
    ('5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t', 'RunMaster64', '2020-03-22'),
    ('6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u', 'WorldRecordHunter', '2020-02-10');

-- Sample Categories
INSERT INTO Category (id, name, description) VALUES
    ('7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v', '120 Stars', 'Collect all 120 stars in the game'),
    ('8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w', '100%', 'Complete everything in the game'),
    ('9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x', 'Any%', 'Complete the game as fast as possible');

-- Sample Speedruns
INSERT INTO Speedrun (id, gameId, runnerId, time_ms, date, categoryId) VALUES
    ('0j1k2l3m-4n5o-6p7q-8r9s-0t1u2v3w4x5y', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', 6843.21, '2023-01-15', '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v'),
    ('1k2l3m4n-5o6p-7q8r-9s0t-1u2v3w4x5y6z', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t', 12654.87, '2023-02-20', '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w'),
    ('2l3m4n5o-6p7q-8r9s-0t1u-2v3w4x5y6z7a', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u', 3421.54, '2023-03-10', '9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x'),
    ('3m4n5o6p-7q8r-9s0t-1u2v-3w4x5y6z7a8b', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', 12345.67, '2023-04-05', '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w'),
    ('4n5o6p7q-8r9s-0t1u-2v3w-4x5y6z7a8b9c', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t', 12154.32, '2023-05-01', '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w'),
    ('5o6p7q8r-9s0t-1u2v-3w4x-5y6z7a8b9c0d', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u', 11987.65, '2023-06-15', '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w'),
    ('6p7q8r9s-0t1u-2v3w-4x5y-6z7a8b9c0d1e', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', 11876.54, '2023-07-20', '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w'),
    ('7q8r9s0t-1u2v-3w4x-5y6z-7a8b9c0d1e2f', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t', 11765.43, '2023-08-25', '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w');