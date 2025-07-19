# MCP Query API Route

This route provides a natural language interface to query your Supabase database using Superglue MCP integration.

## Setup

1. **Environment Variables**: Add to your `.env.local`:
   ```
   SUPERGLUE_API_KEY=your_superglue_api_key_here
   GRAPHQL_ENDPOINT=https://api.superglue.ai/graphql
   ```

2. **Database Integration**: Ensure your Supabase integration is configured in Superglue with ID `supabase_postgres-1`

## Usage

### POST `/api/mcp-query`

**Request Body:**
```json
{
  "prompt": "How many unique users do we have?"
}
```

**Response:**
```json
{
  "query": "SELECT COUNT(DISTINCT user_id) FROM public.basic_paying_flow",
  "data": [
    { "user_count": 17974 }
  ],
  "metadata": {
    "rowCount": 1,
    "columns": ["user_count"],
    "dataTypes": ["integer"],
    "executionTime": 245
  },
  "visualization": {
    "suggestedCharts": ["metric", "table"],
    "chartConfig": {
      "title": "Total Unique Users",
      "type": "metric"
    }
  }
}
```

## Database Schema Context

The route includes comprehensive database context for:
- `auth.users`: User authentication data
- `public.basic_paying_flow`: Payment processing events
- `public.onchain_fiat_transaction`: Crypto transactions

## Business Logic

- "users" refers to unique user_id values in basic_paying_flow
- "revenue" refers to total_amount in basic_paying_flow
- "transactions" can mean payment flows or crypto transactions
- "crypto volume" refers to crypto_amount in onchain_fiat_transaction

## Error Handling

- Returns 400 for missing prompt
- Returns 500 for API key configuration issues
- Returns 500 for workflow execution failures
- Includes detailed error messages for debugging 