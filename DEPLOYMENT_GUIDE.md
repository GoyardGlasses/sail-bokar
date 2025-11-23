# SAIL Bokaro - Deployment Guide

This guide provides step-by-step instructions for deploying the SAIL Bokaro application to Vercel (frontend) and Render (backend).

---

## Table of Contents

1. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Environment Variables](#environment-variables)
4. [Troubleshooting](#troubleshooting)

---

## Frontend Deployment (Vercel)

### Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Node.js 18+ installed locally

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository (`GoyardGlasses/sail-bokar`)
4. Click **"Import"**

### Step 2: Configure Build Settings

Vercel will auto-detect the configuration from `vercel.json`. Verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm install`

### Step 3: Set Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
VITE_API_URL = https://sail-bokaro.onrender.com
VITE_DEMO_MODE = false
VITE_ADMIN_TOKEN = sail-bokaro-admin-token-secret
```

Replace `https://sail-bokaro.onrender.com` with your actual Render backend URL.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (typically 2-3 minutes)
3. Your frontend will be available at: `https://<your-project>.vercel.app`

### Automatic Deployments

- Any push to the `main` branch will trigger an automatic deployment
- Pull requests will create preview deployments

---

## Backend Deployment (Render)

### Prerequisites

- Render account (https://render.com)
- GitHub repository connected to Render
- PostgreSQL database (optional, but recommended for production)

### Step 1: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repository
4. Configure the service:

   - **Name**: `sail-bokaro`
   - **Environment**: `Python 3.11`
   - **Build Command**: `cd backend && pip install --no-cache-dir -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 10000`

### Step 2: Set Environment Variables

In Render Service Settings → Environment, add:

```
APP_NAME=SAIL Bokaro
APP_VERSION=1.0.0
DEBUG=false
CORS_ORIGINS=https://<your-vercel-frontend>.vercel.app,http://localhost:5173
MODELS_PATH=./ml/models
LOGS_PATH=./logs
API_TIMEOUT=30
SECRET_TOKEN=<generate-a-strong-secret>
DATABASE_URL=<your-postgresql-url>
```

**Important**: Replace placeholders with actual values.

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Your API will be available at: `https://sail-bokaro.onrender.com`

### Step 4: Update Frontend Environment

Once you have the Render backend URL:

1. Go to Vercel Project Settings → Environment Variables
2. Update `VITE_API_URL` to your Render backend URL
3. Redeploy the frontend

---

## Environment Variables

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://sail-bokaro.onrender.com` |
| `VITE_DEMO_MODE` | Enable demo mode | `false` |
| `VITE_ADMIN_TOKEN` | Admin authentication token | `sail-bokaro-admin-token-secret` |

### Backend (Render)

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | `SAIL Bokaro` |
| `APP_VERSION` | Application version | `1.0.0` |
| `DEBUG` | Debug mode | `false` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |
| `MODELS_PATH` | Path to ML models | `./ml/models` |
| `LOGS_PATH` | Path to logs directory | `./logs` |
| `API_TIMEOUT` | Request timeout (seconds) | `30` |
| `SECRET_TOKEN` | Secret token for API | Required |
| `DATABASE_URL` | PostgreSQL connection string | Optional |
| `PORT` | Server port | `10000` |
| `HOST` | Server host | `0.0.0.0` |

---

## Troubleshooting

### Vercel Build Fails

**Problem**: Build fails with "Cannot find module" errors

**Solution**:
1. Check that `frontend/package.json` exists
2. Verify `frontend/` directory structure
3. Check `.vercelignore` to ensure it's not excluding necessary files
4. Review build logs in Vercel dashboard

**Problem**: Frontend can't connect to backend

**Solution**:
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check that backend is running on Render
3. Verify CORS is configured correctly in backend (`CORS_ORIGINS`)
4. Check browser console for CORS errors

### Render Build Fails

**Problem**: Build fails with "pip install" errors

**Solution**:
1. Check `backend/requirements.txt` for syntax errors
2. Ensure all dependencies are compatible with Python 3.11
3. Review build logs in Render dashboard
4. Try building locally: `cd backend && pip install -r requirements.txt`

**Problem**: Application crashes after deployment

**Solution**:
1. Check Render logs for error messages
2. Verify all required environment variables are set
3. Check that `backend/app/main.py` exists and is valid
4. Ensure `backend/ml/models/` directory exists (or models will use mock mode)

**Problem**: Database connection errors

**Solution**:
1. Verify `DATABASE_URL` is set correctly
2. Check database credentials
3. Ensure database is accessible from Render
4. If no database, the app will still run in CSV mode

### CORS Errors

**Problem**: Frontend gets CORS errors when calling backend

**Solution**:
1. In Render, update `CORS_ORIGINS` to include your Vercel frontend URL
2. Format: `https://your-project.vercel.app`
3. Multiple origins separated by commas: `https://app.vercel.app,http://localhost:5173`
4. Redeploy backend after changing

---

## Monitoring

### Vercel

- **Logs**: Vercel Dashboard → Project → Deployments → Logs
- **Analytics**: Vercel Dashboard → Analytics
- **Performance**: Vercel Dashboard → Performance

### Render

- **Logs**: Render Dashboard → Service → Logs
- **Metrics**: Render Dashboard → Service → Metrics
- **Health**: `https://sail-bokaro.onrender.com/meta/health`

---

## Rollback

### Vercel

1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click the three dots → **"Promote to Production"**

### Render

1. Go to Render Dashboard → Service → Deploys
2. Find the previous successful deployment
3. Click **"Deploy"** to redeploy

---

## Support

For issues or questions:

1. Check deployment logs (Vercel/Render dashboards)
2. Review the application logs
3. Verify all environment variables are set correctly
4. Test API endpoints using curl or Postman
5. Check GitHub issues for known problems

---

**Last Updated**: November 23, 2025  
**Version**: 1.0.0
