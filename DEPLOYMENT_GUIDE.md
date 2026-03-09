# 🎯 VISUAL DEPLOYMENT GUIDE

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT FLOW                          │
└─────────────────────────────────────────────────────────────┘

Step 1: Get Groq API Key
┌──────────────────────┐
│  console.groq.com    │
│  ↓                   │
│  Sign Up (Free)      │
│  ↓                   │
│  Create API Key      │
│  ↓                   │
│  Copy Key (gsk_...)  │
└──────────────────────┘

Step 2: Update Local .env
┌──────────────────────────────────┐
│  backend/.env                    │
│  ────────────────────────────    │
│  GROQ_API_KEY=gsk_xxxxx...       │
└──────────────────────────────────┘

Step 3: Push to GitHub
┌──────────────────────────────────┐
│  git add .                       │
│  git commit -m "Deploy ready"    │
│  git push origin main            │
└──────────────────────────────────┘

Step 4: Deploy Backend
┌──────────────────────────────────┐
│  render.com                      │
│  ↓                               │
│  New Web Service                 │
│  ↓                               │
│  Connect GitHub Repo             │
│  ↓                               │
│  Root: backend                   │
│  Build: pip install -r ...       │
│  Start: uvicorn main:app ...     │
│  ↓                               │
│  Add Env: GROQ_API_KEY           │
│  ↓                               │
│  Deploy! ✅                      │
│  ↓                               │
│  Copy URL:                       │
│  https://your-app.onrender.com   │
└──────────────────────────────────┘

Step 5: Update vercel.json
┌──────────────────────────────────────────────┐
│  frontend/vercel.json                        │
│  ────────────────────────────────────────    │
│  "destination":                              │
│  "https://your-app.onrender.com/api/:path*"  │
└──────────────────────────────────────────────┘

Step 6: Push Update
┌──────────────────────────────────┐
│  git add frontend/vercel.json    │
│  git commit -m "Add Render URL"  │
│  git push origin main            │
└──────────────────────────────────┘

Step 7: Deploy Frontend
┌──────────────────────────────────┐
│  vercel.com                      │
│  ↓                               │
│  New Project                     │
│  ↓                               │
│  Import GitHub Repo              │
│  ↓                               │
│  Root: frontend                  │
│  Framework: Vite                 │
│  ↓                               │
│  Deploy! ✅                      │
│  ↓                               │
│  Copy URL:                       │
│  https://your-app.vercel.app     │
└──────────────────────────────────┘

Step 8: Test & Share!
┌──────────────────────────────────┐
│  Open Vercel URL                 │
│  ↓                               │
│  Test: "I have fever"            │
│  ↓                               │
│  Chatbot responds! ✅            │
│  ↓                               │
│  Share URL with everyone! 🎉     │
└──────────────────────────────────┘
```

---

## 🔄 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                         │
└─────────────────────────────────────────────────────────────┘

User Browser
     │
     │ Opens: https://your-app.vercel.app
     ↓
┌────────────────────┐
│  Vercel (Frontend) │
│  ─────────────────│
│  • React UI        │
│  • Vite Build      │
│  • Static Files    │
└────────────────────┘
     │
     │ API calls to /api/*
     │ (Proxied via vercel.json)
     ↓
┌────────────────────┐
│ Render (Backend)   │
│ ──────────────────│
│ • FastAPI Server   │
│ • Python Runtime   │
│ • Port $PORT       │
└────────────────────┘
     │
     │ AI requests
     ↓
┌────────────────────┐
│  Groq API          │
│  ─────────────────│
│  • llama3-8b-8192  │
│  • Fast inference  │
│  • Free tier       │
└────────────────────┘
```

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] Groq API key obtained
- [ ] backend/.env updated with key
- [ ] Code tested locally (optional)
- [ ] Code pushed to GitHub

### Backend Deployment (Render)
- [ ] Render account created
- [ ] GitHub repo connected
- [ ] Root directory set to `backend`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variable `GROQ_API_KEY` added
- [ ] Service deployed successfully
- [ ] Render URL copied

### Frontend Configuration
- [ ] frontend/vercel.json updated with Render URL
- [ ] Changes committed and pushed to GitHub

### Frontend Deployment (Vercel)
- [ ] Vercel account created
- [ ] GitHub repo connected
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Vite
- [ ] Project deployed successfully
- [ ] Vercel URL copied

### Testing
- [ ] Vercel URL opens successfully
- [ ] Chatbot UI loads
- [ ] Can send messages
- [ ] AI responds correctly
- [ ] No console errors

### Sharing
- [ ] URL shared with friends/family
- [ ] Feedback collected
- [ ] Issues documented (if any)

---

## ⏱️ Estimated Time

| Step | Time | Difficulty |
|------|------|------------|
| Get Groq API Key | 2 min | ⭐ Easy |
| Update .env | 1 min | ⭐ Easy |
| Push to GitHub | 2 min | ⭐ Easy |
| Deploy Backend (Render) | 5 min | ⭐⭐ Medium |
| Update vercel.json | 1 min | ⭐ Easy |
| Deploy Frontend (Vercel) | 3 min | ⭐⭐ Medium |
| Test & Share | 2 min | ⭐ Easy |
| **TOTAL** | **~15 min** | ⭐⭐ Medium |

---

## 💰 Cost Breakdown

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Groq API | Free | $0 | 30 req/min |
| Render.com | Free | $0 | 750 hrs/month |
| Vercel | Hobby | $0 | Unlimited bandwidth |
| **TOTAL** | | **$0/month** | Perfect for personal use |

---

## 🎯 Success Criteria

✅ Backend deployed on Render
✅ Frontend deployed on Vercel
✅ Chatbot responds to messages
✅ No errors in console
✅ URL is shareable
✅ Works on mobile & desktop
✅ Available 24/7

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend not responding
**Symptom**: Frontend shows "Connection Error"
**Solution**: 
- Check Render logs for errors
- Verify GROQ_API_KEY is set in Render
- Wait 30 seconds (cold start)

### Issue 2: CORS errors
**Symptom**: Browser console shows CORS error
**Solution**:
- Verify vercel.json has correct Render URL
- Redeploy frontend after updating vercel.json

### Issue 3: Groq API errors
**Symptom**: "Check your Groq API key" error
**Solution**:
- Verify key at console.groq.com
- Check key is added in Render env vars
- Try regenerating API key

### Issue 4: Slow first response
**Symptom**: First message takes 30+ seconds
**Solution**:
- This is normal (Render cold start)
- Subsequent requests will be fast
- Consider Render paid plan for always-on

---

## 📱 Mobile Testing

After deployment, test on:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad
- [ ] Desktop Chrome
- [ ] Desktop Firefox

---

## 🔐 Security Notes

✅ .env file is in .gitignore (not committed)
✅ API key stored in Render env vars (encrypted)
✅ CORS configured properly
✅ No sensitive data in frontend code
✅ HTTPS enabled by default (Vercel & Render)

---

## 🎉 You're Ready!

Follow the steps above and your chatbot will be live in ~15 minutes!

**Questions?** Check:
- README.md (detailed guide)
- QUICKSTART.md (quick checklist)
- CHANGES.md (what changed)
