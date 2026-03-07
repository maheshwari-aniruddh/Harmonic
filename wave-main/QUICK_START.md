# Wave Mashup Feature - Quick Start Guide

## 🎯 Current Status

✅ **Backend**: Running with CORS enabled
✅ **Frontend**: Ready with mashup UI
✅ **Authentication**: Working
❌ **Database Tables**: **NOT CREATED YET** ← You need to do this!

## 🚀 Quick Setup (2 Steps)

### Step 1: Create Database Tables (REQUIRED)

**Option A: Azure Portal (Easiest)**
1. Go to https://portal.azure.com
2. Open your database: `wavedata` on `bensql67.database.windows.net`
3. Click "Query editor"
4. Login: `benjamin` / `Cs2060684#`
5. Copy & paste from `setup-mashup-tables.sql`
6. Click Run

**Option B: One-Line Copy/Paste**

Just paste this into your SQL query editor:

```sql
CREATE TABLE mashups (id INT PRIMARY KEY, name NVARCHAR(255) NOT NULL, creator NVARCHAR(255) NOT NULL, spotifyLinkString NVARCHAR(MAX), likes INT DEFAULT 0, createdAt DATETIME NOT NULL, isPublic BIT DEFAULT 0);
CREATE TABLE mashupLikes (mashupId INT NOT NULL, username NVARCHAR(255) NOT NULL, PRIMARY KEY (mashupId, username), FOREIGN KEY (mashupId) REFERENCES mashups(id));
CREATE INDEX idx_mashups_creator ON mashups(creator);
CREATE INDEX idx_mashups_public ON mashups(isPublic);
CREATE INDEX idx_mashups_likes ON mashups(likes DESC);
CREATE INDEX idx_mashups_createdAt ON mashups(createdAt DESC);
```

### Step 2: Test Everything

Run the test script:

```bash
./test-mashup.sh
```

If all tests pass, you're ready to go! 🎉

## 🎵 Using the Mashup Feature

### Backend (should already be running)

```bash
cd wave-backend-master
go run main.go data.go
```

### Frontend

```bash
npm run dev
```

### Try It Out

1. Open http://localhost:3000
2. Click **Sign In** → Create account
3. Click **"DJ Mashup Studio"** card (purple/pink gradient)
4. Select 2-3 songs
5. Click **"Create AI Mashup ✨"**
6. Watch the magic happen! ✨

## 📋 Available Songs

The mashup library has 12 popular songs:

1. Blinding Lights - The Weeknd
2. Shape of You - Ed Sheeran
3. Uptown Funk - Bruno Mars
4. Levitating - Dua Lipa
5. Bad Guy - Billie Eilish
6. Don't Start Now - Dua Lipa
7. Watermelon Sugar - Harry Styles
8. Save Your Tears - The Weeknd
9. Peaches - Justin Bieber
10. Industry Baby - Lil Nas X
11. Heat Waves - Glass Animals
12. Stay - The Kid LAROI

## ⚠️ Troubleshooting

### "Invalid object name 'mashups'"
→ **Database tables not created**
→ **Fix**: Run Step 1 above

### Backend not responding
→ **Check if running**: `lsof -ti:8080`
→ **Restart**: `cd wave-backend-master && go run main.go data.go`

### "Sign in required"
→ **Not authenticated**
→ **Fix**: Click "Sign In" button and create account

### Frontend errors in console
→ **Check backend is running**
→ **Check CORS is enabled** (it is - we added it)
→ **Check database tables exist**

## 📚 Documentation Files

- **SETUP_DATABASE.md** - Detailed database setup guide
- **BACKEND_FIX.md** - CORS fix and backend info
- **MASHUP_SETUP.md** - Complete feature documentation
- **test-mashup.sh** - Automated testing script

## 🎯 What Works Right Now

✅ User authentication (sign in/sign up)
✅ Song selection (12 songs with search)
✅ Beautiful UI with animations
✅ Backend API for creating mashups
✅ Backend API for likes and shares
✅ Public mashup feed (backend ready)
❌ **Database tables** (you need to create them!)
❌ Actual audio mixing (future feature)

## 🔧 Quick Commands

```bash
# Test if backend is running
lsof -ti:8080

# Kill backend
kill -9 $(lsof -ti:8080)

# Start backend
cd wave-backend-master && go run main.go data.go

# Start frontend
npm run dev

# Run all tests
./test-mashup.sh

# Test mashup creation
curl -X POST http://localhost:8080/mashups/create \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","creator":"user","songs":["s1","s2"],"isPublic":true}'
```

## 🎨 Features

- **Song Selection**: Choose from 12 popular songs
- **Search**: Filter by title, artist, or genre
- **BPM & Key Info**: See technical details for each song
- **Processing Animation**: Beautiful vinyl record spinning
- **Mashup Naming**: Auto-generated from artist names
- **Public Sharing**: Mark mashups as public
- **Like System**: Like/unlike mashups (backend ready)
- **User Library**: View your created mashups (backend ready)

---

**Bottom Line**: Create the database tables (Step 1), run the test script (Step 2), then enjoy making mashups! 🎧
