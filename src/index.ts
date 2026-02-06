import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

// Microsoft Clarity API configuration
const CLARITY_API_TOKEN = process.env.CLARITY_API_TOKEN;
const API_BASE_URL = 'https://clarity.microsoft.com/mcp';

if (!CLARITY_API_TOKEN) {
  console.warn('⚠️  CLARITY_API_TOKEN not set. API calls will fail.');
}

// Helper function for API calls
async function callClarityAPI(endpoint: string, body: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CLARITY_API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Clarity API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Initialize MCP server
const server = new McpServer(
  { name: 'clarity-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Tool 1: Query Analytics Dashboard
server.registerTool(
  'query-analytics-dashboard',
  {
    description: 'Retrieves analytics data and metrics from your Clarity project dashboard using a simplified natural language search query. Use this to get traffic stats, user behavior metrics, and performance data.',
    inputSchema: z.object({
      query: z.string().describe('Natural language query for analytics data (e.g., "show me bounce rate for the last 7 days", "top pages by sessions this month")'),
      timezone: z.string().optional().describe('Timezone for the query (defaults to UTC). Example: "America/New_York"'),
    }),
  },
  async ({ query, timezone }) => {
    try {
      console.log(`[query-analytics-dashboard] Query: ${query}`);

      const result = await callClarityAPI('/dashboard/query', {
        query,
        timezone: timezone || 'UTC',
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }],
      };
    } catch (error: any) {
      console.error(`[query-analytics-dashboard] Error:`, error.message);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            query,
          }, null, 2)
        }],
      };
    }
  }
);

// Tool 2: List Session Recordings
server.registerTool(
  'list-session-recordings',
  {
    description: 'Retrieves a list of session recordings from your Clarity project with advanced filtering options. Filter by device type, browser, OS, location, URL patterns, and more. Dates must be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ).',
    inputSchema: z.object({
      start: z.string().optional().describe('Start date in ISO 8601 format (defaults to 2 days ago). Example: "2024-01-01" or "2024-01-01T00:00:00.000Z"'),
      end: z.string().optional().describe('End date in ISO 8601 format (defaults to now). Example: "2024-01-31" or "2024-01-31T23:59:59.999Z"'),
      filters: z.record(z.any()).optional().describe('Filters object with keys like "deviceType", "browser", "os", "country", "url". Example: {"deviceType": "Mobile", "country": "US"}'),
      sortBy: z.string().optional().describe('Sort field (e.g., "sessionStart", "duration"). Defaults to "sessionStart"'),
      count: z.number().optional().describe('Number of recordings to retrieve (max 100, defaults to 10)'),
    }),
  },
  async ({ start, end, filters, sortBy, count }) => {
    try {
      console.log(`[list-session-recordings] Fetching recordings from ${start || '2 days ago'} to ${end || 'now'}`);

      // Default to 2 days ago if no start date
      const startDate = start || new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = end || new Date().toISOString();

      const result = await callClarityAPI('/recordings/sample', {
        start: startDate,
        end: endDate,
        filters: filters || {},
        sortBy: sortBy || 'sessionStart',
        count: Math.min(count || 10, 100),
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }],
      };
    } catch (error: any) {
      console.error(`[list-session-recordings] Error:`, error.message);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            filters,
          }, null, 2)
        }],
      };
    }
  }
);

// Tool 3: Query Documentation Resources
server.registerTool(
  'query-documentation-resources',
  {
    description: 'Retrieves snippets from Microsoft Clarity documentation to find answers to user questions. Use this to get help with setup, troubleshooting, feature explanations, and best practices.',
    inputSchema: z.object({
      query: z.string().describe('Natural language question about Clarity (e.g., "how do I install Clarity on WordPress?", "what are heatmaps?", "how to filter rage clicks?")'),
    }),
  },
  async ({ query }) => {
    try {
      console.log(`[query-documentation-resources] Query: ${query}`);

      const result = await callClarityAPI('/documentation/query', {
        query,
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }],
      };
    } catch (error: any) {
      console.error(`[query-documentation-resources] Error:`, error.message);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            query,
          }, null, 2)
        }],
      };
    }
  }
);

// Express app setup
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clarity-mcp-server',
    hasToken: !!CLARITY_API_TOKEN,
  });
});

// MCP endpoint - supports both GET and POST for Streamable HTTP
const handleMcp = async (req: any, res: any) => {
  const transport = new StreamableHTTPServerTransport();
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
};

app.get('/mcp', handleMcp);
app.post('/mcp', handleMcp);

app.listen(port, () => {
  console.log(`🚀 Microsoft Clarity MCP Server running on port ${port}`);
  console.log(`📊 API Token: ${CLARITY_API_TOKEN ? '✓ Configured' : '✗ Missing'}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🔗 MCP endpoint: http://localhost:${port}/mcp`);
});
