# DJ Mashup Feature - Setup & Testing Guide

## Overview
The Wave app now includes an AI DJ Mashup feature that allows users to select 2-3 songs and create a seamless mashup. The feature includes:
- Song selection interface with 12 popular songs
- Backend API for storing mashups
- Public sharing and like/unlike functionality
- Beautiful processing animations
- Integration with user authentication

## Backend Setup

### 1. Database Setup

First, you need to create the required database tables. Run the SQL script provided:

```bash
cd wave-backend-master
```

Execute the SQL script in your Azure SQL Server database:
```sql
-- Located in: wave-backend-master/setup-mashup-tables.sql

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
```

### 2. Start the Backend Server

The backend has been updated with the following new endpoints:

**Mashup Endpoints:**
- `POST /mashups/create` - Create a new mashup
- `GET /mashups/:id?username=<username>` - Get a specific mashup
- `GET /mashups/user/:username` - Get all mashups by a user
- `GET /mashups/public?username=<username>` - Get all public mashups
- `POST /mashups/:id/like` - Like a mashup
- `POST /mashups/:id/unlike` - Unlike a mashup
- `DELETE /mashups/:id` - Delete a mashup

Start the backend server:

```bash
cd wave-backend-master
go run main.go data.go
```

The server will start on port 8080.

### 3. Test Backend Endpoints

You can test the endpoints using curl or Postman:

**Create a Mashup:**
```bash
curl -X POST http://localhost:8080/mashups/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Vibes Mix",
    "creator": "testuser",
    "songs": ["spotify:track:0VjIjW4GlUZAMYd2vXMi3b", "spotify:track:7qiZfU4dY1lWllzX7mPBI9"],
    "isPublic": true
  }'
```

**Get Public Mashups:**
```bash
curl http://localhost:8080/mashups/public?username=testuser
```

**Like a Mashup:**
```bash
curl -X POST http://localhost:8080/mashups/12345678/like \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser"}'
```

## Frontend Setup

### 1. Install Dependencies

The frontend is already set up with all required dependencies. If you need to reinstall:

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### 3. Access the DJ Mashup Feature

1. **Navigate to Home Page**: Open http://localhost:3000
2. **Find DJ Mashup Card**: Look for the "DJ Mashup Studio" card in the "Features" section (purple/pink gradient with 🎧 emoji)
3. **Click to Open**: Click the card to go to `/mashup`

## Using the DJ Mashup Feature

### Step 1: Sign In
- You must be signed in to create mashups
- Click "Sign In" in the top right if not already authenticated
- Create an account or log in

### Step 2: Select Songs
- Browse the 12 available songs in the library
- Use the search bar to filter by song title, artist, or genre
- Click on songs to add them to your selection (maximum 3)
- Each selected song shows BPM and key information
- You can remove songs by clicking the X button

### Step 3: Create Mashup
- Once you have 2-3 songs selected, click "Create AI Mashup ✨"
- The app will:
  1. Call the backend API to save the mashup
  2. Show a beautiful processing animation with spinning vinyl records
  3. Display progress through 7 processing steps
  4. Show the completed mashup with a player interface

### Step 4: Mashup Ready
- View your created mashup with combined album art
- See the auto-generated mashup name (e.g., "The Weeknd × Ed Sheeran Mashup")
- Use the player controls (currently mock UI)
- Options available:
  - **Create Another**: Start a new mashup
  - **Save to Library**: Save to your personal library (future feature)
  - **Share**: Share with the Wave community (future feature)

## Available Songs

The mashup feature includes 12 popular songs:

1. **Blinding Lights** - The Weeknd (171 BPM, F minor)
2. **Shape of You** - Ed Sheeran (96 BPM, C# minor)
3. **Uptown Funk** - Bruno Mars (115 BPM, D minor)
4. **Levitating** - Dua Lipa (103 BPM, B minor)
5. **Bad Guy** - Billie Eilish (135 BPM, G minor)
6. **Don't Start Now** - Dua Lipa (124 BPM, B minor)
7. **Watermelon Sugar** - Harry Styles (95 BPM, D major)
8. **Save Your Tears** - The Weeknd (118 BPM, C major)
9. **Peaches** - Justin Bieber (90 BPM, C major)
10. **Industry Baby** - Lil Nas X (150 BPM, F major)
11. **Heat Waves** - Glass Animals (81 BPM, B major)
12. **Stay** - The Kid LAROI (170 BPM, C major)

## API Integration Details

### Request Format

**Create Mashup:**
```json
{
  "name": "Summer Vibes Mix",
  "creator": "username",
  "songs": [
    "spotify:track:0VjIjW4GlUZAMYd2vXMi3b",
    "spotify:track:7qiZfU4dY1lWllzX7mPBI9"
  ],
  "isPublic": true
}
```

### Response Format

**Successful Creation:**
```json
{
  "id": 12345678
}
```

**Get Mashup Response:**
```json
{
  "id": 12345678,
  "name": "Summer Vibes Mix",
  "creator": "username",
  "songs": [
    "spotify:track:0VjIjW4GlUZAMYd2vXMi3b",
    "spotify:track:7qiZfU4dY1lWllzX7mPBI9"
  ],
  "likes": 5,
  "createdAt": "2024-12-06T10:30:00Z",
  "isPublic": true,
  "isLiked": false
}
```

## Features Implemented

### ✅ Completed
- [x] Backend API endpoints for mashup CRUD operations
- [x] Database schema for mashups and likes
- [x] Song selection interface with search
- [x] Beautiful UI with gradient animations
- [x] Processing animation with progress tracking
- [x] Backend integration for mashup creation
- [x] Authentication requirement
- [x] Public/private mashup option
- [x] Like/unlike functionality (backend)
- [x] Share functionality (backend)

### 🚧 Future Enhancements
- [ ] Actual audio mashup generation using AI
- [ ] Real-time playback of created mashups
- [ ] Public mashup feed/gallery
- [ ] Like button integration in UI
- [ ] Share to social media
- [ ] Download mashup as audio file
- [ ] Advanced mashup settings (transition style, BPM matching)
- [ ] Collaborative mashups (multiple users)
- [ ] Mashup remixing (edit existing mashups)

## Troubleshooting

### Backend not connecting
- Ensure the Go backend is running on port 8080
- Check that the database connection string in `data.go` is correct
- Verify the database tables were created successfully

### CORS Errors
- The backend uses Gin with default CORS settings
- For development, CORS should be handled by the framework
- If issues persist, add CORS middleware to `main.go`

### Songs not loading
- Check browser console for errors
- Verify the backend is returning proper JSON responses
- Ensure authentication is working correctly

### Mashup creation fails
- Verify you are signed in
- Check that at least 2 songs are selected
- Look at browser console for detailed error messages
- Verify backend is receiving the request (check Go logs)

## Database Schema

### mashups Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key (8-digit random number) |
| name | NVARCHAR(255) | Mashup name |
| creator | NVARCHAR(255) | Username of creator |
| spotifyLinkString | NVARCHAR(MAX) | Dot-separated Spotify URIs |
| likes | INT | Number of likes (default: 0) |
| createdAt | DATETIME | Creation timestamp |
| isPublic | BIT | Public visibility flag |

### mashupLikes Table
| Column | Type | Description |
|--------|------|-------------|
| mashupId | INT | Foreign key to mashups |
| username | NVARCHAR(255) | Username who liked |

## Next Steps

To make the mashups functional with actual audio:

1. **Integrate Spotify Web Playback SDK**
   - Add Spotify player to the ready stage
   - Stream selected songs

2. **Implement AI Mashup Generation**
   - Use audio processing library (e.g., Essentia, librosa)
   - Analyze BPM, key, and structure
   - Create smooth transitions
   - Export as audio file

3. **Add Public Feed**
   - Create `/mashups/community` page
   - Display public mashups sorted by likes/date
   - Add like/unlike buttons
   - Implement search and filters

4. **Enhance Player**
   - Add real audio playback
   - Waveform visualization
   - Track progress
   - Volume controls

## Support

For issues or questions:
1. Check the browser console for errors
2. Check the Go backend logs
3. Verify database connectivity
4. Ensure all tables are created correctly
5. Test endpoints individually using curl/Postman
