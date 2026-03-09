# 🚀 QUICK START - Do This NOW!

## ✅ Step-by-Step Checklist

### 1️⃣ Get Groq API Key (2 minutes)
- [ ] Go to https://console.groq.com
- [ ] Sign up (free, no credit card)
- [ ] Create API Key
- [ ] Copy the key (starts with `gsk_...`)

### 2️⃣ Update Local .env File
- [ ] Open `backend/.env`
- [ ] Replace `your_groq_api_key_here` with your actual key
- [ ] Save the file

### 3️⃣ Test Locally (Optional but Recommended)
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```
- [ ] Open http://localhost:5173
- [ ] Test the chatbot

### 4️⃣ Push to GitHub
```bash
git add .
git commit -m "Migrate to Groq API for free deployment"
git push origin main
```

### 5️⃣ Deploy Backend on Render.com
- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] New Web Service → Connect your repo
- [ ] Root Directory: `backend`
- [ ] Build: `pip install -r requirements.txt`
- [ ] Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Add Environment Variable: `GROQ_API_KEY` = (your key)
- [ ] Deploy!
- [ ] **COPY YOUR RENDER URL** (e.g., https://healthcare-chatbot-xyz.onrender.com)

### 6️⃣ Update vercel.json
- [ ] Open `frontend/vercel.json`
- [ ] Replace `YOUR-RENDER-APP` with your Render URL
- [ ] Save and push to GitHub

### 7️⃣ Deploy Frontend on Vercel
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] New Project → Import your repo
- [ ] Root Directory: `frontend`
- [ ] Framework: Vite
- [ ] Deploy!
- [ ] **COPY YOUR VERCEL URL**

### 8️⃣ Test Live Deployment
- [ ] Open your Vercel URL
- [ ] Ask: "I have fever, what should I do?"
- [ ] Chatbot should respond!

---

## 🎉 DONE! Your chatbot is live 24/7 for FREE!

Share your Vercel URL with anyone!

---

## 📝 Important Files Changed

✅ `backend/main.py` - Replaced Ollama with Groq
✅ `backend/requirements.txt` - Updated dependencies
✅ `backend/.env` - Add your Groq API key here
✅ `backend/.gitignore` - Protects sensitive files
✅ `frontend/vite.config.js` - Production build config
✅ `frontend/vercel.json` - API proxy for Vercel
✅ `render.yaml` - Render deployment config
✅ `.github/workflows/deploy.yml` - Auto-deploy workflow
✅ `README.md` - Complete documentation

---

## ⚠️ IMPORTANT: DO NOT COMMIT .env FILE!

The `.gitignore` file already excludes it, but double-check:
```bash
git status
# .env should NOT appear in the list
```

---

## 🆘 Need Help?

1. **Backend not working?** Check Render logs
2. **Frontend can't connect?** Verify vercel.json has correct URL
3. **Groq errors?** Check API key at console.groq.com

---

**Total Cost: $0.00/month** 🎉
