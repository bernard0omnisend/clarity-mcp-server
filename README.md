# Microsoft Clarity MCP Server

HTTP MCP server for Microsoft Clarity analytics, session recordings, and documentation queries.

## Features

This server provides three tools for interacting with Microsoft Clarity:

1. **query-analytics-dashboard** - Query analytics data using natural language
   - Traffic stats, bounce rates, conversion metrics
   - User behavior and engagement data
   - Performance metrics and insights

2. **list-session-recordings** - Retrieve and filter session recordings
   - Filter by device type, browser, OS, country, URL
   - Date range filtering
   - Sort and limit results

3. **query-documentation-resources** - Search Clarity documentation
   - Setup guides and installation help
   - Feature explanations and best practices
   - Troubleshooting assistance

## Prerequisites

- Node.js 18+
- Microsoft Clarity account with API access
- Clarity API token (get from [Clarity Settings](https://clarity.microsoft.com/settings))

## Local Development

### 1. Install Dependencies

```bash
cd clarity_mcp
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Clarity API token:

```env
CLARITY_API_TOKEN=your_actual_token_here
PORT=3000
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:3000

### 4. Test the Server

Health check:
```bash
curl http://localhost:3000/health
```

Test analytics query:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query-analytics-dashboard",
      "arguments": {
        "query": "show me total sessions for the last 7 days"
      }
    }
  }'
```

## Railway Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Clarity MCP server"
git remote add origin https://github.com/yourusername/clarity-mcp.git
git push -u origin main
```

### 2. Deploy to Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `clarity-mcp` repository
4. Railway will auto-detect the `Procfile` and deploy

### 3. Configure Environment Variables

In Railway dashboard:
1. Go to your project → Variables tab
2. Add environment variables:
   - `CLARITY_API_TOKEN` = your_clarity_token
   - `PORT` = 3000 (Railway auto-sets this, but you can override)

**Important:** Ensure no extra spaces before/after the token value.

### 4. Get Your Railway URL

After deployment, Railway provides a URL like:
```
https://clarity-mcp-production.up.railway.app
```

Test it:
```bash
curl https://your-app.up.railway.app/health
```

## Dust.tt Integration

### Add MCP Connection to Dust

1. Go to your Dust workspace
2. Navigate to Settings → MCP Connections
3. Add new connection:
   - **Name:** Microsoft Clarity
   - **URL:** `https://your-app.up.railway.app/mcp`
4. Save and the tools will be available to your Dust agents

### Example Dust Agent Prompts

**Analytics queries:**
- "What's the bounce rate for the last week?"
- "Show me top landing pages by traffic this month"
- "Compare desktop vs mobile sessions"

**Session recordings:**
- "Get the last 20 mobile sessions from the US"
- "Show me sessions with rage clicks"
- "Find sessions on the checkout page from yesterday"

**Documentation help:**
- "How do I set up Clarity with Google Tag Manager?"
- "What are the different types of heatmaps?"
- "How to filter for dead clicks?"

## Tool Reference

### 1. query-analytics-dashboard

Query analytics data using natural language.

**Parameters:**
- `query` (required): Natural language question
- `timezone` (optional): Timezone string (default: UTC)

**Example:**
```json
{
  "query": "show me bounce rate trends for the last 30 days",
  "timezone": "America/New_York"
}
```

### 2. list-session-recordings

Retrieve filtered session recordings.

**Parameters:**
- `start` (optional): Start date ISO 8601 (default: 2 days ago)
- `end` (optional): End date ISO 8601 (default: now)
- `filters` (optional): Filter object (device, browser, country, url, etc.)
- `sortBy` (optional): Sort field (default: sessionStart)
- `count` (optional): Number of results, max 100 (default: 10)

**Example:**
```json
{
  "start": "2024-01-01",
  "end": "2024-01-31",
  "filters": {
    "deviceType": "Mobile",
    "country": "US"
  },
  "count": 50
}
```

**Available filter fields:**
- `deviceType`: "Desktop", "Mobile", "Tablet"
- `browser`: "Chrome", "Safari", "Firefox", "Edge", etc.
- `os`: "Windows", "macOS", "iOS", "Android", etc.
- `country`: ISO country code (e.g., "US", "GB", "CA")
- `url`: URL pattern or specific path

### 3. query-documentation-resources

Search Clarity documentation.

**Parameters:**
- `query` (required): Natural language question

**Example:**
```json
{
  "query": "how to set up Clarity on a WordPress site?"
}
```

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "clarity-mcp-server",
  "hasToken": true
}
```

### GET|POST /mcp
MCP protocol endpoint for tool calls.

## Troubleshooting

### "CLARITY_API_TOKEN not set"
- Check your `.env.local` file locally or Railway environment variables
- Ensure no extra spaces in the token value
- Get a new token from [Clarity Settings](https://clarity.microsoft.com/settings)

### "Clarity API error (401)"
- Invalid or expired API token
- Generate a new token from Clarity dashboard

### "Clarity API error (403)"
- Token doesn't have access to the requested project
- Verify token permissions in Clarity settings

### Railway deployment fails
- Check Railway logs for specific errors
- Verify `Procfile` exists and contains `web: npm start`
- Ensure all environment variables are set correctly

## Development

### Project Structure
```
clarity_mcp/
├── src/
│   └── index.ts        # Main server file
├── package.json
├── tsconfig.json
├── Procfile            # Railway deployment
├── .env.example
├── .env.local          # Local config (gitignored)
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm run build` - Build check (uses tsx in production)
- `npm run lint` - Lint TypeScript files

## Resources

- [Microsoft Clarity](https://clarity.microsoft.com/)
- [Clarity API Documentation](https://learn.microsoft.com/en-us/clarity/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Railway Deployment Docs](https://docs.railway.app/)

## License

MIT
