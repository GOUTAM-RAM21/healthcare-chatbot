from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

app = FastAPI(title="HealthCare AI Chatbot API", version="1.0.0")

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# CORS - React frontend ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# SYSTEM PROMPT - Medical AI ka behavior define karta hai
# ============================================================
MEDICAL_SYSTEM_PROMPT = """
You are MediBot, a helpful AI health assistant for a Smart Healthcare Platform.

YOUR ROLE:
- Provide general health information and guidance
- Help patients understand their symptoms
- Explain medical terms in simple language
- Guide patients on when to seek emergency care
- Remind patients to follow their doctor's advice

STRICT RULES:
1. NEVER diagnose diseases - always say "consult your doctor"
2. For emergencies (chest pain, difficulty breathing, unconscious) → always say "Call 108 immediately"
3. Keep responses clear, simple, and compassionate
4. If asked about medications, give general info only - never prescribe doses
5. Always end with encouragement to consult a real doctor

RESPONSE FORMAT:
- Be warm and empathetic
- Use simple language (avoid heavy medical jargon)
- Keep responses concise but helpful (3-5 sentences max unless explanation needed)
- Use bullet points for symptoms/steps when helpful

Remember: You assist doctors and patients, you do NOT replace them.
"""

# ============================================================
# DATA MODELS
# ============================================================
class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Message]] = []
    patient_name: Optional[str] = "Patient"
    language: Optional[str] = "english"  # "english" or "hindi"

class ChatResponse(BaseModel):
    reply: str
    is_emergency: bool
    suggested_actions: List[str]

# ============================================================
# HELPER: Emergency check
# ============================================================
EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "unconscious",
    "seizure", "stroke", "severe bleeding", "not breathing",
    "chati dard", "sans nahi", "behosh", "zyada khoon"
]

def check_emergency(message: str) -> bool:
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in EMERGENCY_KEYWORDS)

# ============================================================
# MAIN CHAT ENDPOINT
# ============================================================
@app.post("/api/chat", response_model=ChatResponse)
async def medical_chat(request: ChatRequest):
    try:
        is_emergency = check_emergency(request.message)

        # Language instruction add karo system prompt mein
        system = MEDICAL_SYSTEM_PROMPT
        if request.language == "hindi":
            system += "\nIMPORTANT: Always respond in Hindi (Devanagari script)."

        # Conversation history build karo
        messages = [{"role": "system", "content": system}]

        # Purani history add karo (last 10 messages)
        for msg in request.conversation_history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})

        # Naya message add karo
        messages.append({
            "role": "user",
            "content": f"Patient name: {request.patient_name}\n\n{request.message}"
        })

        # Emergency message add karo agar zaroorat ho
        if is_emergency:
            messages.append({
                "role": "system",
                "content": "EMERGENCY DETECTED! Start your response with: '🚨 EMERGENCY: Please call 108 immediately!' then provide brief first-aid guidance."
            })

        # Groq se response lo
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        reply = response.choices[0].message.content

        # Suggested actions
        suggested_actions = []
        if is_emergency:
            suggested_actions = ["📞 Call 108 immediately", "🏥 Go to nearest emergency room"]
        else:
            suggested_actions = [
                "📅 Book appointment with your doctor",
                "💊 Check your medication schedule",
                "📊 View your health records"
            ]

        return ChatResponse(
            reply=reply,
            is_emergency=is_emergency,
            suggested_actions=suggested_actions
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}. Check your Groq API key!"
        )

# ============================================================
# QUICK SYMPTOM CHECK ENDPOINT
# ============================================================
class SymptomRequest(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None

@app.post("/api/symptom-check")
async def symptom_check(request: SymptomRequest):
    try:
        symptoms_text = ", ".join(request.symptoms)
        patient_info = ""
        if request.age:
            patient_info += f"Age: {request.age}, "
        if request.gender:
            patient_info += f"Gender: {request.gender}"

        prompt = f"""
        Patient information: {patient_info}
        Symptoms reported: {symptoms_text}
        
        Please provide:
        1. Possible common conditions (NOT a diagnosis)
        2. Home care tips if appropriate
        3. Red flags - when to see doctor urgently
        4. General advice
        
        Keep it brief and compassionate. Always recommend consulting a doctor.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": MEDICAL_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1024,
        )

        return {
            "analysis": response.choices[0].message.content,
            "disclaimer": "This is AI-generated general information only. Please consult a qualified doctor for proper diagnosis and treatment."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# HEALTH CHECK
# ============================================================
@app.get("/")
def root():
    return {
        "status": "HealthCare AI Chatbot API is running!",
        "model": "llama-3.1-8b-instant (Groq)",
        "endpoints": ["/api/chat", "/api/symptom-check", "/docs"]
    }

@app.get("/health")
def health_check():
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            return {"status": "ok", "groq": "connected"}
        else:
            return {"status": "error", "groq": "API key not found"}
    except:
        return {"status": "error", "groq": "connection failed"}

# ============================================================
# APPOINTMENT BOOKING SYSTEM
# ============================================================

# In-memory storage
DOCTORS = [
    {"id": 1, "name": "Dr. Sharma", "specialty": "General Physician", "available_days": [0,1,2,3,4]},
    {"id": 2, "name": "Dr. Patel", "specialty": "Cardiologist", "available_days": [1,3,5]},
    {"id": 3, "name": "Dr. Singh", "specialty": "Pediatrician", "available_days": [0,2,4]},
    {"id": 4, "name": "Dr. Verma", "specialty": "Dermatologist", "available_days": [1,2,3,4]},
]

APPOINTMENTS = []  # {id, doctor_id, patient_name, date, time, status}
MEDICATIONS = []  # {id, patient_name, medication, dosage, frequency, times}
HEALTH_RECORDS = {
    "Goutam Das": {
        "appointments": [{"doctor": "Dr. Sharma", "date": "10 March 2024", "reason": "General checkup"}],
        "medications": ["Paracetamol 500mg", "Metformin 500mg"],
        "symptoms": ["Fever", "Headache"],
        "allergies": ["None reported"]
    }
}

class AppointmentBooking(BaseModel):
    doctor_id: int
    patient_name: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM

class Medication(BaseModel):
    name: str
    dosage: str
    frequency: str
    patient_name: str

@app.get("/api/doctors")
def get_doctors():
    return {"doctors": DOCTORS}

@app.get("/api/available-slots")
def get_available_slots(doctor_id: int, date: str):
    doctor = next((d for d in DOCTORS if d["id"] == doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    try:
        slot_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    if slot_date.weekday() not in doctor["available_days"]:
        return {"slots": []}
    
    # Generate time slots (9 AM to 5 PM, 30-min intervals)
    slots = []
    booked_times = {a["time"] for a in APPOINTMENTS if a["doctor_id"] == doctor_id and a["date"] == date}
    
    for hour in range(9, 17):
        for minute in [0, 30]:
            time_str = f"{hour:02d}:{minute:02d}"
            slots.append({"time": time_str, "available": time_str not in booked_times})
    
    return {"slots": slots}

@app.post("/api/book-appointment")
def book_appointment(booking: AppointmentBooking):
    # Validate doctor
    doctor = next((d for d in DOCTORS if d["id"] == booking.doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check if slot is available
    existing = next((a for a in APPOINTMENTS 
                    if a["doctor_id"] == booking.doctor_id 
                    and a["date"] == booking.date 
                    and a["time"] == booking.time), None)
    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")
    
    # Create appointment
    appointment = {
        "id": len(APPOINTMENTS) + 1,
        "doctor_id": booking.doctor_id,
        "doctor_name": doctor["name"],
        "patient_name": booking.patient_name,
        "date": booking.date,
        "time": booking.time,
        "status": "confirmed"
    }
    APPOINTMENTS.append(appointment)
    
    return {
        "success": True,
        "message": f"Appointment confirmed with {doctor['name']} on {booking.date} at {booking.time}",
        "appointment": appointment
    }

# ============================================================
# MEDICATION SCHEDULE
# ============================================================
@app.post("/api/medication-schedule")
def create_medication_schedule(medication: Medication):
    times = []
    if medication.frequency.lower() in ["once", "once a day", "1"]:
        times = ["09:00 AM"]
    elif medication.frequency.lower() in ["twice", "twice a day", "2"]:
        times = ["09:00 AM", "09:00 PM"]
    elif medication.frequency.lower() in ["thrice", "three times", "3"]:
        times = ["09:00 AM", "02:00 PM", "09:00 PM"]
    else:
        times = ["09:00 AM"]
    
    med_entry = {
        "id": len(MEDICATIONS) + 1,
        "patient_name": medication.patient_name,
        "medication": medication.name,
        "dosage": medication.dosage,
        "frequency": medication.frequency,
        "times": times
    }
    MEDICATIONS.append(med_entry)
    
    schedule_text = f"**Medication Schedule for Today:**\n\n"
    for time in times:
        schedule_text += f"• {medication.name} {medication.dosage} — {time}\n"
    schedule_text += f"\n💧 Please take your medicine with water and follow your doctor's instructions."
    
    return {"success": True, "schedule": schedule_text, "medication": med_entry}

@app.get("/api/medication-schedule/{patient_name}")
def get_medication_schedule(patient_name: str):
    patient_meds = [m for m in MEDICATIONS if m["patient_name"] == patient_name]
    
    if not patient_meds:
        return {"schedule": "No medications scheduled yet.", "medications": []}
    
    schedule_text = f"**Medication Schedule for Today:**\n\n"
    for med in patient_meds:
        for time in med["times"]:
            schedule_text += f"• {med['medication']} {med['dosage']} — {time}\n"
    schedule_text += f"\n💧 Please take your medicine with water and follow your doctor's instructions."
    
    return {"schedule": schedule_text, "medications": patient_meds}

# ============================================================
# HEALTH RECORDS
# ============================================================
@app.get("/api/health-records/{patient_name}")
def get_health_records(patient_name: str):
    patient_appointments = [a for a in APPOINTMENTS if a["patient_name"] == patient_name]
    patient_meds = [m for m in MEDICATIONS if m["patient_name"] == patient_name]
    
    if patient_name not in HEALTH_RECORDS:
        HEALTH_RECORDS[patient_name] = {
            "appointments": [],
            "medications": [],
            "symptoms": [],
            "allergies": ["None reported"]
        }
    
    record = HEALTH_RECORDS[patient_name]
    
    summary = f"**Health Record Summary**\n\n"
    summary += f"**Patient Name:** {patient_name}\n\n"
    
    summary += f"**Recent Appointments:**\n"
    if patient_appointments:
        for apt in patient_appointments[-3:]:
            summary += f"• {apt['doctor_name']} — {apt['date']}\n"
    elif record["appointments"]:
        for apt in record["appointments"]:
            summary += f"• {apt['doctor']} — {apt['date']}\n"
    else:
        summary += "• No appointments recorded\n"
    
    summary += f"\n**Medications:**\n"
    if patient_meds:
        for med in patient_meds:
            summary += f"• {med['medication']} {med['dosage']}\n"
    elif record["medications"]:
        for med in record["medications"]:
            summary += f"• {med}\n"
    else:
        summary += "• No medications recorded\n"
    
    summary += f"\n**Reported Symptoms:**\n"
    if record["symptoms"]:
        for symptom in record["symptoms"]:
            summary += f"• {symptom}\n"
    else:
        summary += "• No symptoms recorded\n"
    
    summary += f"\n**Allergies:**\n"
    for allergy in record["allergies"]:
        summary += f"• {allergy}\n"
    
    return {
        "success": True,
        "summary": summary,
        "record": {
            "appointments": patient_appointments + record["appointments"],
            "medications": patient_meds,
            "symptoms": record["symptoms"],
            "allergies": record["allergies"]
        }
    }
