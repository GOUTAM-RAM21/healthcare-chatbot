import { useState, useRef, useEffect } from "react";

const BACKEND_URL = "http://localhost:8000";

const QUICK_QUESTIONS = [
  "I have fever and headache, what should I do?",
  "What are symptoms of diabetes?",
  "How to manage high blood pressure?",
  "I feel chest pain, is it serious?",
  "What medicines for common cold?",
];

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function MediBotChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm **MediBot** 👋, your AI health assistant.\n\nI can help you with:\n• General health questions\n• Understanding symptoms\n• When to see a doctor\n• Health tips & advice\n\n*Remember: I provide general information only — always consult your doctor for medical advice.*",
      time: new Date(),
      isEmergency: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [patientName] = useState("Patient");
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentStep, setAppointmentStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFrequency, setMedFrequency] = useState("once");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (showAppointmentModal && appointmentStep === 1 && doctors.length === 0) {
      fetchDoctors();
    }
  }, [showAppointmentModal, appointmentStep]);

  const getHistory = () =>
    messages
      .filter((m) => m.id !== 1)
      .map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    setInput("");

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: msgText,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText,
          conversation_history: getHistory(),
          patient_name: patientName,
          language,
        }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply,
          time: new Date(),
          isEmergency: data.is_emergency,
          actions: data.suggested_actions,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `⚠️ **Connection Error**\n\nCould not connect to backend server at ${BACKEND_URL}/api/chat\n\nPlease make sure FastAPI backend is running:\n\`cd backend\`\n\`uvicorn main:app --reload --port 8000\`\n\nError: ${err.message}`,
          time: new Date(),
          isEmergency: false,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/•/g, "•")
      .replace(/\n/g, "<br/>");
  };

  const SYMPTOM_LIST = [
    "Fever", "Headache", "Cough", "Cold", "Chest Pain",
    "Fatigue", "Nausea", "Vomiting", "Body Ache", "Dizziness",
    "Breathlessness", "Stomach Pain", "Sore Throat", "Back Pain"
  ];

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/doctors`);
      const data = await res.json();
      setDoctors(data.doctors);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  };

  const fetchSlots = async (doctorId, date) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/available-slots?doctor_id=${doctorId}&date=${date}`);
      const data = await res.json();
      setAvailableSlots(data.slots.filter(s => s.available));
    } catch (err) {
      console.error("Failed to fetch slots", err);
    }
  };

  const bookAppointment = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/book-appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          patient_name: patientName,
          date: selectedDate,
          time: selectedSlot
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content: `✅ **Appointment Confirmed!**\n\n${data.message}\n\nYou will receive a confirmation SMS shortly.`,
          time: new Date(),
          isEmergency: false
        }]);
        closeAppointmentModal();
      }
    } catch (err) {
      alert("Failed to book appointment. Please try again.");
    }
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setAppointmentStep(1);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleActionClick = (action) => {
    if (action.includes("Book appointment")) {
      setShowAppointmentModal(true);
    } else if (action.includes("medication schedule")) {
      setShowMedicationModal(true);
    } else if (action.includes("health records")) {
      fetchHealthRecords();
    }
  };

  const addMedication = async () => {
    if (!medName || !medDosage) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/medication-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: medName,
          dosage: medDosage,
          frequency: medFrequency,
          patient_name: patientName
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content: data.schedule,
          time: new Date(),
          isEmergency: false
        }]);
        setShowMedicationModal(false);
        setMedName("");
        setMedDosage("");
        setMedFrequency("once");
      }
    } catch (err) {
      alert("Failed to create medication schedule.");
    }
  };

  const fetchHealthRecords = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health-records/${patientName}`);
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content: data.summary,
          time: new Date(),
          isEmergency: false
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "⚠️ Failed to fetch health records. Please try again.",
        time: new Date(),
        isEmergency: false
      }]);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e8f5f3 0%, #f0f9f7 50%, #e3f4f0 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 16px",
    }}>

      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 760,
        background: "white",
        borderRadius: "20px 20px 0 0",
        padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 20px rgba(0,128,100,0.08)",
        borderBottom: "2px solid #e8f5f3",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo */}
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #0d9488, #14b8a6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 4px 12px rgba(13,148,136,0.3)"
          }}>🏥</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0f766e" }}>MediBot</div>
            <div style={{ fontSize: 12, color: "#5eead4", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
              AI Health Assistant • Online
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {/* Language Toggle */}
          <div style={{
            display: "flex", background: "#f0fdf9", borderRadius: 10, padding: 3,
            border: "1px solid #ccfbf1"
          }}>
            {["english", "hindi"].map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)} style={{
                padding: "5px 12px", borderRadius: 8, border: "none",
                background: language === lang ? "#0d9488" : "transparent",
                color: language === lang ? "white" : "#5eead4",
                fontWeight: 600, fontSize: 12, cursor: "pointer",
                transition: "all 0.2s"
              }}>
                {lang === "english" ? "EN" : "हि"}
              </button>
            ))}
          </div>

          {/* Symptom Checker Button */}
          <button onClick={() => setShowSymptomChecker(!showSymptomChecker)} style={{
            padding: "7px 14px", borderRadius: 10,
            background: showSymptomChecker ? "#0d9488" : "#f0fdf9",
            color: showSymptomChecker ? "white" : "#0d9488",
            border: "1px solid #ccfbf1", fontWeight: 600, fontSize: 12,
            cursor: "pointer", transition: "all 0.2s"
          }}>
            🩺 Symptom Check
          </button>
        </div>
      </div>

      {/* Symptom Checker Panel */}
      {showSymptomChecker && (
        <div style={{
          width: "100%", maxWidth: 760, background: "#f0fdf9",
          padding: "16px 24px", borderBottom: "1px solid #ccfbf1",
          boxShadow: "0 2px 8px rgba(0,128,100,0.06)"
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f766e", marginBottom: 10 }}>
            Select your symptoms:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {SYMPTOM_LIST.map((s) => (
              <button key={s} onClick={() =>
                setSelectedSymptoms(prev =>
                  prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                )
              } style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                border: "1.5px solid",
                borderColor: selectedSymptoms.includes(s) ? "#0d9488" : "#ccfbf1",
                background: selectedSymptoms.includes(s) ? "#0d9488" : "white",
                color: selectedSymptoms.includes(s) ? "white" : "#5eead4",
                fontWeight: 500, transition: "all 0.15s"
              }}>{s}</button>
            ))}
          </div>
          {selectedSymptoms.length > 0 && (
            <button onClick={() => {
              sendMessage(`I have these symptoms: ${selectedSymptoms.join(", ")}. What should I do?`);
              setShowSymptomChecker(false);
              setSelectedSymptoms([]);
            }} style={{
              padding: "8px 20px", borderRadius: 10,
              background: "#0d9488", color: "white",
              border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
              Analyze {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? "s" : ""} →
            </button>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div style={{
        width: "100%", maxWidth: 760, flex: 1,
        background: "white",
        padding: "20px 24px",
        overflowY: "auto",
        minHeight: 420, maxHeight: 500,
        boxShadow: "0 2px 20px rgba(0,128,100,0.05)",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: "flex",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-end", gap: 8,
          }}>
            {/* Avatar */}
            {msg.role === "assistant" && (
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: msg.isError ? "#fef3c7" : "linear-gradient(135deg, #0d9488, #14b8a6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, boxShadow: "0 2px 8px rgba(13,148,136,0.2)"
              }}>🏥</div>
            )}

            <div style={{ maxWidth: "72%" }}>
              {/* Emergency Banner */}
              {msg.isEmergency && (
                <div style={{
                  background: "#fef2f2", border: "1.5px solid #fca5a5",
                  borderRadius: "10px 10px 0 0", padding: "6px 12px",
                  fontSize: 12, color: "#dc2626", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6
                }}>
                  🚨 EMERGENCY DETECTED — Call 108 Now!
                </div>
              )}

              {/* Bubble */}
              <div style={{
                padding: "12px 16px",
                borderRadius: msg.role === "user"
                  ? "16px 4px 16px 16px"
                  : msg.isEmergency ? "0 0 16px 16px" : "4px 16px 16px 16px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #0d9488, #14b8a6)"
                  : msg.isError ? "#fffbeb" : "#f8fffe",
                color: msg.role === "user" ? "white" : "#1e3a35",
                fontSize: 14, lineHeight: 1.6,
                border: msg.role === "assistant" ? "1px solid #e0f7f4" : "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
              }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />

              {/* Suggested Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {msg.actions.map((action, i) => (
                    <button key={i} onClick={() => handleActionClick(action)} style={{
                      padding: "4px 10px", borderRadius: 8,
                      background: "#f0fdf9", border: "1px solid #ccfbf1",
                      fontSize: 11, color: "#0f766e", fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s"
                    }}
                      onMouseEnter={e => e.target.style.background = "#ccfbf1"}
                      onMouseLeave={e => e.target.style.background = "#f0fdf9"}
                    >{action}</button>
                  ))}
                </div>
              )}

              {/* Time */}
              <div style={{
                fontSize: 10, color: "#94a3b8", marginTop: 4,
                textAlign: msg.role === "user" ? "right" : "left"
              }}>
                {formatTime(msg.time)}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
            }}>🏥</div>
            <div style={{
              padding: "12px 18px", borderRadius: "4px 16px 16px 16px",
              background: "#f8fffe", border: "1px solid #e0f7f4",
              display: "flex", gap: 5, alignItems: "center"
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#0d9488",
                  animation: "bounce 1.2s infinite",
                  animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Questions */}
      <div style={{
        width: "100%", maxWidth: 760, background: "#f8fffe",
        padding: "10px 24px", borderTop: "1px solid #e0f7f4",
        display: "flex", gap: 8, overflowX: "auto",
      }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => sendMessage(q)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12,
            background: "white", border: "1.5px solid #ccfbf1",
            color: "#0f766e", cursor: "pointer", whiteSpace: "nowrap",
            fontWeight: 500, transition: "all 0.15s",
            flexShrink: 0,
          }}
            onMouseEnter={e => { e.target.background = "#f0fdf9"; e.target.style.borderColor = "#0d9488"; }}
            onMouseLeave={e => { e.target.style.background = "white"; e.target.style.borderColor = "#ccfbf1"; }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        width: "100%", maxWidth: 760,
        background: "white",
        padding: "16px 24px",
        borderRadius: "0 0 20px 20px",
        boxShadow: "0 4px 20px rgba(0,128,100,0.08)",
        display: "flex", gap: 12, alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === "hindi" ? "अपना सवाल यहाँ लिखें..." : "Describe your symptoms or ask a health question..."}
          rows={2}
          style={{
            flex: 1, padding: "12px 16px", borderRadius: 14,
            border: "1.5px solid #ccfbf1", outline: "none",
            fontSize: 14, fontFamily: "inherit", resize: "none",
            color: "#1e3a35", background: "#f8fffe",
            transition: "border-color 0.2s",
            lineHeight: 1.5,
          }}
          onFocus={e => e.target.style.borderColor = "#0d9488"}
          onBlur={e => e.target.style.borderColor = "#ccfbf1"}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          style={{
            width: 48, height: 48, borderRadius: 14, border: "none",
            background: input.trim() && !loading
              ? "linear-gradient(135deg, #0d9488, #14b8a6)"
              : "#e2e8f0",
            color: input.trim() && !loading ? "white" : "#94a3b8",
            fontSize: 20, cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: input.trim() && !loading ? "0 4px 12px rgba(13,148,136,0.3)" : "none",
            transition: "all 0.2s", flexShrink: 0,
          }}>
          {loading ? "⏳" : "➤"}
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: 12, fontSize: 11, color: "#94a3b8", textAlign: "center", maxWidth: 600
      }}>
        ⚕️ MediBot provides general health information only. Always consult a qualified doctor for medical advice and treatment.
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20
        }} onClick={closeAppointmentModal}>
          <div style={{
            background: "white", borderRadius: 20, padding: 24, maxWidth: 500, width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "80vh", overflowY: "auto", position: "relative"
          }} onClick={e => e.stopPropagation()}>
            
            <button onClick={closeAppointmentModal} style={{
              position: "absolute", top: 16, right: 16, background: "#f1f5f9",
              border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer",
              fontSize: 16, color: "#64748b"
            }}>×</button>

            {appointmentStep === 1 && (
              <>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0f766e", marginBottom: 16 }}>
                  📅 Book Appointment
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                  Select a doctor to continue
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {doctors.map(doc => (
                    <button key={doc.id} onClick={() => {
                      setSelectedDoctor(doc);
                      setAppointmentStep(2);
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const dateStr = tomorrow.toISOString().split('T')[0];
                      setSelectedDate(dateStr);
                      fetchSlots(doc.id, dateStr);
                    }} style={{
                      padding: 16, borderRadius: 12, border: "2px solid #e0f7f4",
                      background: "#f8fffe", cursor: "pointer", textAlign: "left",
                      transition: "all 0.2s"
                    }}
                      onMouseEnter={e => { e.target.style.borderColor = "#0d9488"; e.target.style.background = "#f0fdf9"; }}
                      onMouseLeave={e => { e.target.style.borderColor = "#e0f7f4"; e.target.style.background = "#f8fffe"; }}
                    >
                      <div style={{ fontWeight: 600, color: "#0f766e", fontSize: 15 }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: "#5eead4", marginTop: 4 }}>{doc.specialty}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {appointmentStep === 2 && (
              <>
                <button onClick={() => setAppointmentStep(1)} style={{
                  background: "none", border: "none", color: "#0d9488", fontSize: 13,
                  cursor: "pointer", marginBottom: 12, fontWeight: 600
                }}>← Back</button>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f766e", marginBottom: 8 }}>
                  {selectedDoctor?.name}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
                  {selectedDoctor?.specialty}
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#0f766e", display: "block", marginBottom: 8 }}>
                    Select Date
                  </label>
                  <input type="date" value={selectedDate} onChange={e => {
                    setSelectedDate(e.target.value);
                    fetchSlots(selectedDoctor.id, e.target.value);
                    setSelectedSlot(null);
                  }} min={new Date().toISOString().split('T')[0]} style={{
                    width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #ccfbf1",
                    fontSize: 14, outline: "none"
                  }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#0f766e", display: "block", marginBottom: 8 }}>
                    Available Time Slots
                  </label>
                  {availableSlots.length === 0 ? (
                    <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                      No slots available for this date
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {availableSlots.map(slot => (
                        <button key={slot.time} onClick={() => setSelectedSlot(slot.time)} style={{
                          padding: "8px 4px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                          border: "1.5px solid",
                          borderColor: selectedSlot === slot.time ? "#0d9488" : "#ccfbf1",
                          background: selectedSlot === slot.time ? "#0d9488" : "white",
                          color: selectedSlot === slot.time ? "white" : "#0f766e",
                          fontWeight: 600, transition: "all 0.15s"
                        }}>{slot.time}</button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => selectedSlot && setAppointmentStep(3)} disabled={!selectedSlot} style={{
                  width: "100%", padding: 12, borderRadius: 10, border: "none",
                  background: selectedSlot ? "linear-gradient(135deg, #0d9488, #14b8a6)" : "#e2e8f0",
                  color: selectedSlot ? "white" : "#94a3b8",
                  fontWeight: 600, fontSize: 14, cursor: selectedSlot ? "pointer" : "not-allowed"
                }}>Continue →</button>
              </>
            )}

            {appointmentStep === 3 && (
              <>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0f766e", marginBottom: 20 }}>
                  ✅ Confirm Appointment
                </div>
                <div style={{ background: "#f8fffe", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Doctor</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#0f766e", marginBottom: 12 }}>
                    {selectedDoctor?.name} - {selectedDoctor?.specialty}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Date & Time</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#0f766e" }}>
                    {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {selectedSlot}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setAppointmentStep(2)} style={{
                    flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #ccfbf1",
                    background: "white", color: "#0f766e", fontWeight: 600, cursor: "pointer"
                  }}>← Back</button>
                  <button onClick={bookAppointment} style={{
                    flex: 2, padding: 12, borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                    color: "white", fontWeight: 600, cursor: "pointer"
                  }}>Confirm Booking</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Medication Modal */}
      {showMedicationModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20
        }} onClick={() => setShowMedicationModal(false)}>
          <div style={{
            background: "white", borderRadius: 20, padding: 24, maxWidth: 450, width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)", position: "relative"
          }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setShowMedicationModal(false)} style={{
              position: "absolute", top: 16, right: 16, background: "#f1f5f9",
              border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer",
              fontSize: 16, color: "#64748b"
            }}>×</button>

            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f766e", marginBottom: 16 }}>
              💊 Add Medication
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
              Enter your medication details
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0f766e", display: "block", marginBottom: 8 }}>
                Medication Name
              </label>
              <input type="text" value={medName} onChange={e => setMedName(e.target.value)}
                placeholder="e.g., Paracetamol" style={{
                width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #ccfbf1",
                fontSize: 14, outline: "none"
              }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0f766e", display: "block", marginBottom: 8 }}>
                Dosage
              </label>
              <input type="text" value={medDosage} onChange={e => setMedDosage(e.target.value)}
                placeholder="e.g., 500mg" style={{
                width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #ccfbf1",
                fontSize: 14, outline: "none"
              }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0f766e", display: "block", marginBottom: 8 }}>
                Frequency
              </label>
              <select value={medFrequency} onChange={e => setMedFrequency(e.target.value)} style={{
                width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #ccfbf1",
                fontSize: 14, outline: "none", cursor: "pointer"
              }}>
                <option value="once">Once a day</option>
                <option value="twice">Twice a day</option>
                <option value="thrice">Three times a day</option>
              </select>
            </div>

            <button onClick={addMedication} disabled={!medName || !medDosage} style={{
              width: "100%", padding: 12, borderRadius: 10, border: "none",
              background: medName && medDosage ? "linear-gradient(135deg, #0d9488, #14b8a6)" : "#e2e8f0",
              color: medName && medDosage ? "white" : "#94a3b8",
              fontWeight: 600, fontSize: 14, cursor: medName && medDosage ? "pointer" : "not-allowed"
            }}>Create Schedule</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccfbf1; border-radius: 4px; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
