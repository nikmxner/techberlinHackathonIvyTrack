#!/bin/bash

echo "🧪 Testing MCP Query Route with curl"
echo "====================================="

BASE_URL="http://localhost:3000"
ENDPOINT="/api/mcp-query"

# Test 1: Missing prompt
echo -e "\n📝 Test 1: Missing prompt (should return 400)"
curl -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus: %{http_code}\n"

# Test 2: Valid query
echo -e "\n📝 Test 2: Valid query (should return 200)"
curl -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How many unique users do we have?"}' \
  -w "\nStatus: %{http_code}\n"

# Test 3: Revenue query
echo -e "\n📝 Test 3: Revenue query"
curl -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Show me the total revenue from payment flows"}' \
  -w "\nStatus: %{http_code}\n"

# Test 4: Crypto transactions
echo -e "\n📝 Test 4: Crypto transactions"
curl -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How many crypto transactions do we have?"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n✅ Testing complete!" 