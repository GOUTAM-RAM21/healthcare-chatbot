# 🏥 MediBot - AI Medical Chatbot
### FastAPI + Ollama + React

---

## 📁 Project Structure

```
healthcare_chatbot/
├── backend/
│   ├── main.py              ← FastAPI server (main code)
│   └── requirements.txt     ← Python packages
└── frontend/
    └── MediBotChat.jsx      ← React component
```

---

## 🚀 Step-by-Step Setup

### Step 1: Ollama Install karo
```bash
# Website se download karo:
# https://ollama.com/download

# Model download karo (ek baar)
ollama pull llama3

# Start karo
ollama serve
```

### Step 2: Backend Setup
```bash
cd backend

# Packages install karo
pip install -r requirements.txt

# Server start karo
uvicorn main:app --reload --port 8000

# Test karo browser mein:
# http://localhost:8000/docs  ← Swagger UI
```

### Step 3: Frontend Setup
```bash
# Tera existing React project mein copy karo:
# MediBotChat.jsx → src/components/

# Fir use karo:
import MediBotChat from './components/MediBotChat';
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **Medical Chat** | AI doctor assistant with context memory |
| 🩺 **Symptom Checker** | Select symptoms → get AI analysis |
| 🌐 **Hindi/English** | Language toggle |
| 🚨 **Emergency Detection** | Auto detects chest pain, breathing issues etc. |
| ⚡ **Quick Questions** | Pre-set common health questions |

---

## 🔧 Customization

### Model change karo (main.py mein):
```python
# Llama3 (default - best quality)
model="llama3"

# Mistral (faster)
model="mistral"

# Gemma2 (lighter)
model="gemma2"
```

### System prompt customize karo:
`main.py` mein `MEDICAL_SYSTEM_PROMPT` edit karo apni hospital ke according.

---

## 🏥 Teri Project mein Integration

Yeh chatbot teri existing HealthCare app mein add karo:
- Patient dashboard mein "Chat with MediBot" button
- Doctor dashboard mein patient queries dekhne ke liye  
- Mobile app mein bhi same API use hogi

---

## ⚠️ Important Notes

1. Ollama **background mein chalta rehna chahiye** jab bhi API use ho
2. Pehli baar model download mein time lagta hai (~4GB)
3. Production mein proper auth aur rate limiting add karna
4. Medical disclaimer hamesha dikhao users ko
