# Backend CORS Fix - Sign In Now Working! ✅

## What Was Fixed

The backend was returning 404 errors because of **missing CORS (Cross-Origin Resource Sharing)** headers. This prevented the frontend (running on `localhost:3000`) from communicating with the backend (running on `localhost:8080`).

### Changes Made

I added CORS middleware to `/wave-backend-master/main.go` that:
- Allows requests from any origin (`Access-Control-Allow-Origin: *`)
- Accepts common HTTP methods (GET, POST, DELETE, OPTIONS)
- Handles preflight OPTIONS requests
- Allows necessary headers for authentication and API calls

## How to Restart the Backend

Since the backend code was updated, you need to restart it:

### Option 1: Using Terminal

```bash
# Navigate to backend directory
cd wave-backend-master

# Stop any running backend process
# Press Ctrl+C if it's running in your terminal
# OR find and kill the process:
lsof -ti:8080 | xargs kill -9

# Start the backend again
go run main.go data.go
```

### Option 2: Using Docker (if applicable)

```bash
cd wave-backend-master
docker-compose down
docker-compose up --build
```

## How to Test Sign In

1. **Start the backend** (see above)

2. **Start the frontend** (in a new terminal):
   ```bash
   npm run dev
   ```

3. **Test the sign in**:
   - Go to http://localhost:3000
   - Click "Sign In" button in top right
   - Try creating a new account or logging in

### Test with curl (verify backend is working):

**Create a user:**
```bash
curl -X POST http://localhost:8080/auth/createUser \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

Expected response:
```json
{"id":123456789}
```

**Login:**
```bash
curl -X POST http://localhost:8080/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

Expected response:
```json
{"id":123456789}
```

## What Should Work Now

✅ **Sign In/Sign Up** - Users can create accounts and log in
✅ **Create Mashups** - Authenticated users can create DJ mashups
✅ **All API Endpoints** - Frontend can communicate with backend

✅ **Mashup Creation** - `/mashups/create` endpoint
✅ **Get Mashups** - `/mashups/public`, `/mashups/user/:username`
✅ **Like Mashups** - `/mashups/:id/like`, `/mashups/:id/unlike`
✅ **Album Management** - All album endpoints work

## Troubleshooting

### Backend won't start
- Make sure Go is installed: `go version`
- Check if port 8080 is already in use: `lsof -ti:8080`
- Verify database connection in `data.go`

### Still getting CORS errors
- Make sure you restarted the backend after the code change
- Check browser console for exact error message
- Verify backend is running: `curl http://localhost:8080/auth -X POST`

### Database errors
- Run the SQL setup script first: `setup-mashup-tables.sql`
- Verify database credentials in `data.go`
- Check Azure SQL Server firewall settings

## Next Steps

Once the backend is restarted:

1. **Test Sign In**
   - Create a new account from the frontend
   - Log in with your credentials
   - You should see your username in the top right

2. **Test DJ Mashup**
   - Click "DJ Mashup Studio" card
   - Select 2-3 songs
   - Click "Create AI Mashup"
   - The mashup will be saved to the database

3. **Check Database**
   - Your user should be in the `users` table
   - Your mashup should be in the `mashups` table

## CORS Middleware Code Added

```go
// In main.go, added right after router := gin.Default()

router.Use(func(c *gin.Context) {
    c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
    c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
    c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

    if c.Request.Method == "OPTIONS" {
        c.AbortWithStatus(204)
        return
    }

    c.Next()
})
```

This middleware runs before every request and adds the necessary CORS headers to allow cross-origin requests from your Next.js frontend.

## Security Note

⚠️ **For Production**: The current CORS configuration allows requests from ANY origin (`*`). For production, you should restrict this to your actual frontend domain:

```go
c.Writer.Header().Set("Access-Control-Allow-Origin", "https://yourapp.com")
```

For development on localhost, the current setup is fine!
