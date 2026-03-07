# Database Setup for Mashup Feature

## ⚠️ Important: Database Tables Missing

The backend is running and CORS is working, but the **mashup tables don't exist yet** in your database. You need to create them first.

## Quick Setup (3 Steps)

### Step 1: Connect to Your Azure SQL Database

You have two options:

**Option A: Using Azure Portal**
1. Go to https://portal.azure.com
2. Navigate to your SQL Database: `wavedata`
3. Click "Query editor" in the left menu
4. Login with:
   - Username: `benjamin`
   - Password: `Cs2060684#`

**Option B: Using SQL Server Management Studio (SSMS)**
1. Open SSMS
2. Connect with:
   - Server: `bensql67.database.windows.net`
   - Authentication: SQL Server Authentication
   - Login: `benjamin`
   - Password: `Cs2060684#`
   - Database: `wavedata`

### Step 2: Run the SQL Script

Copy and paste the entire content from `setup-mashup-tables.sql`:

```sql
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

Click **"Run"** or press **F5**

### Step 3: Verify Tables Were Created

Run this query to verify:

```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN ('mashups', 'mashupLikes');
```

You should see both tables listed.

## Test the Mashup Feature

Once the tables are created, test the feature:

### 1. Backend Test (Terminal)

```bash
# Test creating a mashup
curl -X POST http://localhost:8080/mashups/create \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Test Mashup",
    "creator":"testuser",
    "songs":["spotify:track:0VjIjW4GlUZAMYd2vXMi3b","spotify:track:7qiZfU4dY1lWllzX7mPBI9"],
    "isPublic":true
  }'
```

Expected response:
```json
{"id":12345678}
```

### 2. Frontend Test (Browser)

1. Make sure backend is running:
   ```bash
   cd wave-backend-master
   go run main.go data.go
   ```

2. Make sure frontend is running:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

4. **Sign in** (create an account if needed)

5. Click **"DJ Mashup Studio"** card

6. Select 2-3 songs from the library

7. Click **"Create AI Mashup ✨"**

8. You should see:
   - Processing animation with spinning vinyl records
   - Progress through 7 steps
   - Completed mashup screen with player controls

## Troubleshooting

### Error: "Invalid object name 'mashups'"
- **Cause**: Tables not created yet
- **Fix**: Run the SQL script in Step 2 above

### Error: "There is already an object named 'mashups'"
- **Cause**: Tables already exist
- **Fix**: You're good to go! Try testing the mashup feature

### Error: "Cannot insert duplicate key"
- **Cause**: Same mashup ID already exists (rare - 8-digit random)
- **Fix**: Just try again, a new random ID will be generated

### Error: "Login failed for user"
- **Cause**: Wrong database credentials
- **Fix**: Check the credentials in `wave-backend-master/data.go`:
  ```go
  var server = "bensql67.database.windows.net"
  var username = "benjamin"
  var password = "Cs2060684#"
  var database = "wavedata"
  ```

### Frontend: "Failed to create mashup"
- **Cause**: Backend not running or tables not created
- **Fix**:
  1. Check backend is running: `lsof -ti:8080`
  2. Check tables exist (run Step 3 verification)
  3. Check browser console for detailed error

## What Happens After Setup

Once tables are created, users can:

✅ **Create Mashups** - Select 2-3 songs and create AI mashups
✅ **Save to Database** - Mashups are stored with unique IDs
✅ **Public Sharing** - Mashups marked as public can be shared
✅ **Like Feature** - Users can like/unlike public mashups (backend ready)
✅ **View Mashups** - Get user's mashups or all public mashups

## Database Schema Quick Reference

### `mashups` Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | 8-digit random ID |
| name | NVARCHAR(255) | Mashup name |
| creator | NVARCHAR(255) | Username |
| spotifyLinkString | NVARCHAR(MAX) | Dot-separated Spotify URIs |
| likes | INT | Like count (default: 0) |
| createdAt | DATETIME | Creation timestamp |
| isPublic | BIT | Public visibility (0 or 1) |

### `mashupLikes` Table
| Column | Type | Description |
|--------|------|-------------|
| mashupId | INT (FK) | References mashups.id |
| username | NVARCHAR(255) | User who liked |

## API Endpoints Available

Once tables are created, these endpoints work:

- `POST /mashups/create` - Create new mashup
- `GET /mashups/:id?username=<user>` - Get specific mashup
- `GET /mashups/user/:username` - Get user's mashups
- `GET /mashups/public?username=<user>` - Get all public mashups
- `POST /mashups/:id/like` - Like a mashup
- `POST /mashups/:id/unlike` - Unlike a mashup
- `DELETE /mashups/:id` - Delete a mashup

## Need Help?

1. **Check backend logs** - Look for database connection errors
2. **Verify database connection** - Make sure `data.go` has correct credentials
3. **Test with curl** - Use the backend test command above
4. **Check browser console** - Look for network errors or API failures

## Next Steps

After tables are created and working:

1. **Test the full flow** - Sign in → Create mashup → View result
2. **Check database** - Query the `mashups` table to see your created mashups
3. **Try like feature** - Use the API endpoints to like mashups
4. **Build public feed** - Create a page to display all public mashups

---

**TL;DR**: Run the SQL script in `setup-mashup-tables.sql` in your Azure SQL database, then test the mashup feature!
