-- SQL Server script to create mashup tables

-- Create mashups table
CREATE TABLE mashups (
    id INT PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    creator NVARCHAR(255) NOT NULL,
    spotifyLinkString NVARCHAR(MAX),
    likes INT DEFAULT 0,
    createdAt DATETIME NOT NULL,
    isPublic BIT DEFAULT 0
);

-- Create mashupLikes table for tracking user likes
CREATE TABLE mashupLikes (
    mashupId INT NOT NULL,
    username NVARCHAR(255) NOT NULL,
    PRIMARY KEY (mashupId, username),
    FOREIGN KEY (mashupId) REFERENCES mashups(id)
);

-- Create indexes for better performance
CREATE INDEX idx_mashups_creator ON mashups(creator);
CREATE INDEX idx_mashups_public ON mashups(isPublic);
CREATE INDEX idx_mashups_likes ON mashups(likes DESC);
CREATE INDEX idx_mashups_createdAt ON mashups(createdAt DESC);
