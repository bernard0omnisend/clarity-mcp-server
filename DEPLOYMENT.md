# Railway Deployment Guide for Clarity MCP Server

## Quick Deploy Steps

### 1. Get Your Clarity API Token

1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Navigate to Settings (or direct link: https://clarity.microsoft.com/settings)
3. Generate an API token
4. Copy the token (you'll need it for Railway)

### 2. Initialize Git Repository

```bash
cd /Users/bernard/Documents/CursorAI/mcp/clarity_mcp
git init
git add .
git commit -m "Initial commit: Microsoft Clarity MCP server"
```

### 3. Push to GitHub

Using `bernard0omnisend` account:

```bash
# Switch to the right GitHub account
gh auth switch --user bernard0omnisend

# Create new repository
gh repo create clarity-mcp-server --public --source=. --remote=origin --push

# Or if repo already exists
git remote add origin https://github.com/bernard0omnisend/clarity-mcp-server.git
git branch -M main
git push -u origin main
```

### 4. Deploy to Railway

1. Go to https://railway.app/
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose `bernard0omnisend/clarity-mcp-server`
5. Railway will detect the `Procfile` and auto-deploy

### 5. Configure Environment Variables

In the Railway dashboard:

1. Click on your deployed service
2. Go to **Variables** tab
3. Add variable:
   - Variable: `CLARITY_API_TOKEN`
   - Value: `[paste your Clarity API token]`

**CRITICAL:** Make sure there are NO spaces before or after the token value!

4. Click **Deploy** to restart with new variables

### 6. Get Your Railway URL

After deployment completes:

1. Railway assigns a URL like: `https://clarity-mcp-server-production.up.railway.app`
2. Copy this URL for Dust integration

### 7. Test Your Deployment

```bash
# Test health endpoint
curl https://clarity-mcp-server-production.up.railway.app/health

# Expected response:
# {"status":"healthy","service":"clarity-mcp-server","hasToken":true}
```

If `hasToken` is `false`, your environment variable wasn't set correctly.

## Dust.tt Integration

### Add to Dust Workspace

1. Go to your Dust workspace
2. Settings → **MCP Connections**
3. Click **Add Connection**
4. Fill in:
   - **Name:** Microsoft Clarity
   - **URL:** `https://clarity-mcp-server-production.up.railway.app/mcp`
5. Click **Save**

### Verify Tools Are Available

The following tools should now be available to your Dust agents:

- `query-analytics-dashboard`
- `list-session-recordings`
- `query-documentation-resources`

### Test with a Dust Agent

Ask your agent:
- "What's the bounce rate for the last 7 days?"
- "Show me the last 10 mobile sessions"
- "How do I install Clarity on WordPress?"

## Troubleshooting

### Environment Variable Issues

**Problem:** `hasToken: false` in health check

**Solutions:**
1. Check Railway Variables tab - is `CLARITY_API_TOKEN` set?
2. Look for extra spaces before/after the token value
3. Try removing and re-adding the variable
4. Redeploy after making changes

### API Call Failures

**Problem:** "Clarity API error (401)"

**Solutions:**
1. Token is invalid or expired
2. Generate a new token from Clarity Settings
3. Update the token in Railway variables
4. Redeploy

**Problem:** "Clarity API error (403)"

**Solutions:**
1. Token doesn't have access to the project
2. Check token permissions in Clarity dashboard
3. Ensure you're querying the correct project

### Railway Deployment Fails

**Check Railway Logs:**
1. Go to Railway dashboard
2. Click on your service
3. Click **Deployments** tab
4. Click on the failed deployment
5. Check logs for error messages

**Common Issues:**
- Missing `Procfile` (should contain: `web: npm start`)
- Missing environment variables
- Port binding issues (Railway auto-sets `PORT`)

## Monitoring

### Railway Dashboard

Monitor your server in Railway:
- **Metrics** tab: CPU, memory, network usage
- **Deployments** tab: Build and deploy logs
- **Variables** tab: Environment configuration

### Health Checks

Set up monitoring with:
- [UptimeRobot](https://uptimerobot.com/) - free monitoring
- Ping `/health` endpoint every 5 minutes
- Alert if status is not "healthy"

## Updating the Server

```bash
# Make code changes
git add .
git commit -m "Description of changes"
git push origin main
```

Railway will automatically detect the push and redeploy.

## Cost

Railway pricing (as of 2024):
- **Free tier:** 500 hours/month (enough for 24/7 operation)
- **Pro plan:** $5/month for more resources if needed

The Clarity MCP server is lightweight and should run comfortably on the free tier.
