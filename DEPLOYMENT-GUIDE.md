# SAIL Bokaro - Deployment Guide

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Click "Import Project"
4. Select your `sail-bokar` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - **VITE_API_URL**: `https://sail-bokaro-backend.onrender.com`
7. Click "Deploy"

**Your Frontend URL**: `https://sail-bokaro-frontend.vercel.app`

---

## Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment
1. Go to [Render](https://render.com/)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `sail-bokaro-backend`
   - **Environment**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
6. Add Environment Variables:
   ```
   APP_NAME=SAIL Bokaro
   APP_VERSION=1.0.0
   DEBUG=false
   SERVER_HOST=0.0.0.0
   SERVER_PORT=10000
   CORS_ORIGINS=https://sail-bokaro-frontend.vercel.app,http://localhost:5173
   MODELS_PATH=./ml/models
   LOGS_PATH=./logs
   API_TIMEOUT=30
   SECRET_TOKEN=your-secret-token-here
   ```
7. Click "Create Web Service"

**Your Backend URL**: `https://sail-bokaro-backend.onrender.com`

---

## Update Frontend with Backend URL

### After Backend is Deployed:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Update `VITE_API_URL` to your Render backend URL
4. Redeploy the frontend

---

## Access Your Live Application

Once both are deployed:
- **Frontend**: https://sail-bokaro-frontend.vercel.app
- **Backend API**: https://sail-bokaro-backend.onrender.com
- **API Docs**: https://sail-bokaro-backend.onrender.com/api/docs
- **Health Check**: https://sail-bokaro-backend.onrender.com/meta/health

---

## Troubleshooting

### Backend Shows as Offline
1. Check Render deployment logs
2. Verify environment variables are set correctly
3. Ensure CORS includes your Vercel domain

### White Screen on Frontend
1. Check browser console (F12)
2. Verify `VITE_API_URL` is correct
3. Check that backend is running

### Build Fails on Vercel
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version is compatible

---

## Share Your Application

Once deployed, share the Vercel URL with anyone:
```
https://sail-bokaro-frontend.vercel.app
```

They can access your full logistics optimization system without installing anything!

---

## Cost Information

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Render**: Free tier includes 750 hours/month (enough for 1 always-on service)

For production, consider upgrading to paid plans for better performance and reliability.

---

## Next Steps

1. Deploy backend to Render
2. Get the backend URL
3. Update frontend environment variables
4. Deploy frontend to Vercel
5. Test the live application
6. Share the URL with others

Need help? Follow the step-by-step instructions above!
