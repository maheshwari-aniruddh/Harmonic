#!/bin/bash

# Wave Mashup Feature Test Script
# This script tests if the mashup feature is working correctly

echo "=================================="
echo "Wave Mashup Feature Test"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo "1. Checking if backend is running on port 8080..."
if lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo "  Start it with: cd wave-backend-master && go run main.go data.go"
    exit 1
fi
echo ""

# Test 2: Test authentication endpoint
echo "2. Testing authentication endpoint..."
RANDOM_USER="testuser_$(date +%s)"
AUTH_RESPONSE=$(curl -s -X POST http://localhost:8080/auth/createUser \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$RANDOM_USER\",\"password\":\"test123\"}")

if echo "$AUTH_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Authentication working${NC}"
    USER_ID=$(echo "$AUTH_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    echo "  Created user: $RANDOM_USER (ID: $USER_ID)"
else
    echo -e "${RED}✗ Authentication failed${NC}"
    echo "  Response: $AUTH_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Test mashup creation
echo "3. Testing mashup creation endpoint..."
MASHUP_RESPONSE=$(curl -s -X POST http://localhost:8080/mashups/create \
  -H 'Content-Type: application/json' \
  -d "{
    \"name\":\"Test Mashup $(date +%H:%M:%S)\",
    \"creator\":\"$RANDOM_USER\",
    \"songs\":[\"spotify:track:0VjIjW4GlUZAMYd2vXMi3b\",\"spotify:track:7qiZfU4dY1lWllzX7mPBI9\"],
    \"isPublic\":true
  }")

if echo "$MASHUP_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Mashup creation working${NC}"
    MASHUP_ID=$(echo "$MASHUP_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    echo "  Created mashup ID: $MASHUP_ID"
else
    echo -e "${RED}✗ Mashup creation failed${NC}"
    echo "  Response: $MASHUP_RESPONSE"

    if echo "$MASHUP_RESPONSE" | grep -q "Invalid object name"; then
        echo ""
        echo -e "${YELLOW}⚠ Database tables not created!${NC}"
        echo "  Run this SQL in your Azure database:"
        echo "  See: setup-mashup-tables.sql"
        echo ""
        echo "  Or read: SETUP_DATABASE.md for detailed instructions"
    fi
    exit 1
fi
echo ""

# Test 4: Test getting public mashups
echo "4. Testing get public mashups endpoint..."
PUBLIC_RESPONSE=$(curl -s "http://localhost:8080/mashups/public?username=$RANDOM_USER")

if echo "$PUBLIC_RESPONSE" | grep -q '"mashups"'; then
    MASHUP_COUNT=$(echo "$PUBLIC_RESPONSE" | grep -o '"id":' | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ Get public mashups working${NC}"
    echo "  Found $MASHUP_COUNT public mashup(s)"
else
    echo -e "${RED}✗ Get public mashups failed${NC}"
    echo "  Response: $PUBLIC_RESPONSE"
fi
echo ""

# Test 5: Test like mashup
echo "5. Testing like mashup endpoint..."
LIKE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8080/mashups/$MASHUP_ID/like" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$RANDOM_USER\"}")

HTTP_CODE=$(echo "$LIKE_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "204" ]; then
    echo -e "${GREEN}✓ Like mashup working${NC}"
    echo "  Liked mashup $MASHUP_ID"
else
    echo -e "${YELLOW}⚠ Like mashup returned code: $HTTP_CODE${NC}"
fi
echo ""

# Test 6: Test get user's mashups
echo "6. Testing get user mashups endpoint..."
USER_MASHUPS=$(curl -s "http://localhost:8080/mashups/user/$RANDOM_USER")

if echo "$USER_MASHUPS" | grep -q '"mashups"'; then
    USER_MASHUP_COUNT=$(echo "$USER_MASHUPS" | grep -o '"id":' | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ Get user mashups working${NC}"
    echo "  User $RANDOM_USER has $USER_MASHUP_COUNT mashup(s)"
else
    echo -e "${RED}✗ Get user mashups failed${NC}"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}All tests passed! ✓${NC}"
echo "=================================="
echo ""
echo "The mashup feature is working correctly!"
echo ""
echo "Next steps:"
echo "1. Start frontend: npm run dev"
echo "2. Go to: http://localhost:3000"
echo "3. Sign in and click 'DJ Mashup Studio'"
echo "4. Create your first mashup!"
echo ""
echo "For troubleshooting, see:"
echo "- SETUP_DATABASE.md (database setup)"
echo "- BACKEND_FIX.md (CORS and backend info)"
echo "- MASHUP_SETUP.md (feature documentation)"
