---
description: Deploy the Online Compiler Application
---

# Deployment Workflow for Online Code Compiler

This workflow guides you through deploying both the frontend (client) and backend (server) of the online compiler.

## Prerequisites

1. Create accounts on:
   - [Vercel](https://vercel.com) or [Netlify](https://netlify.com) for frontend
   - [Render](https://render.com) for backend
2. Have your MongoDB Atlas connection string ready
3. Have your API keys ready (GROQ_API_KEY)

## Part 1: Deploy Backend to Render

### Step 1: Prepare Server for Production
The server is already configured. Ensure `.env` variables are ready to be set in Render dashboard.

### Step 2: Create New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (or use manual deployment)
4. Configure:
   - **Name**: `online-compiler-api` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables on Render
In the "Environment" section, add:
- `MONGODB_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = your JWT secret (generate a strong one for production)
- `GROQ_API_KEY` = your Groq API key
- `PORT` = 5000

### Step 4: Deploy Server
- Click "Create Web Service"
- Wait for deployment to complete
- Copy your server URL (e.g., `https://online-compiler-api.onrender.com`)

## Part 2: Deploy Frontend to Vercel

### Step 1: Update API URL in Client
Update the client to use your deployed backend URL instead of localhost.

### Step 2: Build Configuration
Create `vercel.json` in the client directory (already done if file exists).

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI
// turbo-all
```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to client directory
cd client

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Step 4: Configure Environment Variables (if needed)
If your client needs environment variables:
- Go to Project Settings → Environment Variables
- Add: `VITE_API_URL` = your Render backend URL

## Part 3: Verify Deployment

1. Visit your Vercel URL (frontend)
2. Test the following:
   - User registration/login
   - Code compilation
   - Code history
   - Share functionality
3. Check browser console for any CORS or API errors

## Troubleshooting

### CORS Issues
If you get CORS errors, ensure your server's CORS configuration includes your Vercel domain.

### API Connection Issues
- Verify the API URL in your client matches your Render deployment
- Check Render logs for backend errors
- Ensure all environment variables are set correctly

### Build Failures
- Check build logs in Vercel/Render dashboard
- Ensure all dependencies are in `package.json` (not devDependencies)

## Quick Deploy Commands Summary

```bash
# Backend (Render): Done via dashboard
# Frontend (Vercel CLI):
cd client
vercel --prod
```

## Post-Deployment

1. Update your GitHub README with live URLs
2. Test all features thoroughly
3. Monitor server logs for any issues
4. Set up custom domain (optional)

---

**Note**: Free tier limitations:
- Render: Server may sleep after 15 minutes of inactivity (first request will wake it up, causing 30-60s delay)
- Vercel: Generous free tier with automatic SSL
