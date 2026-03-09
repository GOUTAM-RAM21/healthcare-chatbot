# Healthcare Chatbot - FREE Deployment Guide

## 🚀 Complete Migration from Ollama to Groq API

This project has been migrated from local Ollama to cloud-based Groq API for FREE deployment!

---

## 📋 Deployment Steps

### Step 1: Get FREE Groq API Key

1. Go to https://console.groq.com
2. Sign up (free, no credit card required)
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `gsk_...`)

---

### Step 2: Deploy Backend on Render.com (FREE)

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: healthcare-chatbot-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variable:
   - **Key**: `GROQ_API_KEY`
   - **Value**: (paste your Groq API key from Step 1)
7. Click **"Deploy Web Service"**
8. Wait 2-3 minutes for deployment
9. **Copy your Render URL** (example: `https://healthcare-chatbot-xyz.onrender.com`)

---

### Step 3: Update vercel.json with Render URL

1. Open `frontend/vercel.json`
2. Replace `YOUR-RENDER-APP` with your actual Render URL
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://healthcare-chatbot-xyz.onrender.com/api/:path*"
       }
     ]
   }
   ```
3. Save the file
4. Commit and push to GitHub

---

### Step 4: Deploy Frontend on Vercel (FREE)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
6. Click **"Deploy"**
7. Wait 1-2 minutes for deployment
8. **Copy your Vercel URL** (example: `https://healthcare-chatbot.vercel.app`)

---

### Step 5: Test Your Deployment ✅

1. Open your Vercel URL in browser
2. Try asking: "I have fever and headache, what should I do?"
3. The chatbot should respond using Groq AI!

---

## 🎉 Done!

Your healthcare chatbot is now live 24/7 for FREE!

- **Frontend**: Hosted on Vercel
- **Backend**: Hosted on Render.com
- **AI Model**: Groq's llama3-8b-8192 (FREE tier)

---

## 📁 Project Structure

```
healthcare_chatbot/
├── backend/
│   ├── main.py              # FastAPI backend (Groq integration)
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Groq API key (DO NOT COMMIT)
│   └── .gitignore          # Ignore sensitive files
├── frontend/
│   ├── src/
│   │   └── MediBotChat_1.jsx
│   ├── vite.config.js      # Vite configuration
│   └── vercel.json         # Vercel proxy configuration
├── render.yaml             # Render deployment config
└── README.md               # This file
```

---

## 🔧 Local Development

### Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
# Add your Groq API key to .env file
uvicorn main:app --reload --port 8000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 🔑 Environment Variables

### Backend (.env)
```
GROQ_API_KEY=your_groq_api_key_here
```

### Render.com
Add `GROQ_API_KEY` in Environment Variables section

---

## 🆓 Free Tier Limits

- **Groq**: 30 requests/minute (plenty for personal use)
- **Render.com**: 750 hours/month (always on)
- **Vercel**: Unlimited bandwidth for personal projects

---

## 🐛 Troubleshooting

### Backend not responding?
- Check Render logs for errors
- Verify `GROQ_API_KEY` is set correctly
- Render free tier may sleep after 15 min inactivity (first request wakes it up)

### Frontend can't connect to backend?
- Verify `vercel.json` has correct Render URL
- Check browser console for CORS errors
- Redeploy frontend after updating `vercel.json`

### Groq API errors?
- Check API key is valid at https://console.groq.com
- Verify you haven't exceeded rate limits
- Try regenerating API key

---

## 📞 Support

For issues or questions:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Test backend directly: `https://your-render-url.onrender.com/health`

---

## 🎯 Next Steps

- Share your Vercel URL with friends and family
- Monitor usage in Groq console
- Add custom domain in Vercel (optional)
- Set up GitHub Actions for auto-deployment

---

**Made with ❤️ using FastAPI, React, and Groq AI**
