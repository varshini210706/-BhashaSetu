import { useState, useRef } from "react";
import "./App.css";

const translations = {
  en: {
    tagline: "YOUR DIGITAL GOVERNMENT ASSISTANT",
    heading: "Government Services,",
    headingHighlight: "Made Simple.",
    subtitle: "Ask questions in your preferred language and get simple guidance about government services.",
    help: "How can we help you?",
    choose: "Choose your language and ask your question.",
    select: "Select your language",
    online: "Online",
    welcome: "Welcome to BhashaSetu!",
    suggestionsTitle: "Try asking about these services:",
    income: "Income Certificate",
    caste: "Caste Certificate",
    scholarship: "Student Scholarships",
    placeholder: "Ask about a government service...",
    ask: "Ask",
    loading: "Finding information...",
    guidance: "Application guidance:",
    visit: "Visit Official Portal ↗",
    disclaimer: "BhashaSetu provides informational guidance. Always verify application requirements through official government portals.",
    multilingual: "Multilingual",
    multilingualDesc: "Designed for Indian language accessibility.",
    ai: "AI Assistance",
    aiDesc: "Simple guidance for government services.",
    service: "Service Guidance",
    serviceDesc: "Understand application procedures.",
    footer: "© 2026 BhashaSetu | Making Government Services Accessible to Everyone",
    speak: "Speak Welcome",
    stop: "Stop Speaking",
    error: "Unable to connect. Please check whether the server is running."
  },

  kn: {
    tagline: "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಸರ್ಕಾರಿ ಸಹಾಯಕ",
    heading: "ಸರ್ಕಾರಿ ಸೇವೆಗಳು,",
    headingHighlight: "ಸುಲಭವಾಗಿ.",
    subtitle: "ನಿಮ್ಮ ಇಷ್ಟದ ಭಾಷೆಯಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಮತ್ತು ಸರ್ಕಾರಿ ಸೇವೆಗಳ ಬಗ್ಗೆ ಸರಳ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಿರಿ.",
    help: "ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    choose: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.",
    select: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    online: "ಆನ್‌ಲೈನ್",
    welcome: "ಭಾಷಾಸೇತುವಿಗೆ ಸ್ವಾಗತ!",
    suggestionsTitle: "ಈ ಸೇವೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ:",
    income: "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ",
    caste: "ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ",
    scholarship: "ವಿದ್ಯಾರ್ಥಿವೇತನ",
    placeholder: "ಸರ್ಕಾರಿ ಸೇವೆಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ...",
    ask: "ಕೇಳಿ",
    loading: "ಮಾಹಿತಿಯನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    guidance: "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ:",
    visit: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಿ ↗",
    disclaimer: "ಭಾಷಾಸೇತು ಮಾಹಿತಿಯ ಮಾರ್ಗದರ್ಶನವನ್ನು ಒದಗಿಸುತ್ತದೆ. ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
    multilingual: "ಬಹುಭಾಷಾ ಬೆಂಬಲ",
    multilingualDesc: "ಭಾರತೀಯ ಭಾಷೆಗಳ ಬಳಕೆಗೆ ಅನುಕೂಲಕರವಾಗಿದೆ.",
    ai: "AI ಸಹಾಯ",
    aiDesc: "ಸರ್ಕಾರಿ ಸೇವೆಗಳ ಬಗ್ಗೆ ಸರಳ ಮಾರ್ಗದರ್ಶನ.",
    service: "ಸೇವೆಗಳ ಮಾರ್ಗದರ್ಶನ",
    serviceDesc: "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನವನ್ನು ತಿಳಿಯಿರಿ.",
    footer: "© 2026 ಭಾಷಾಸೇತು | ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಎಲ್ಲರಿಗೂ ಸುಲಭವಾಗಿ ತಲುಪಿಸುವ ಪ್ರಯತ್ನ",
    speak: "ಸ್ವಾಗತ ಸಂದೇಶ ಕೇಳಿ",
    stop: "ಮಾತು ನಿಲ್ಲಿಸಿ",
    error: "ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ಸರ್ವರ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ."
  },

  hi: {
    tagline: "आपका डिजिटल सरकारी सहायक",
    heading: "सरकारी सेवाएं,",
    headingHighlight: "अब आसान।",
    subtitle: "अपनी पसंदीदा भाषा में सवाल पूछें और सरकारी सेवाओं के बारे में सरल जानकारी प्राप्त करें।",
    help: "हम आपकी कैसे मदद कर सकते हैं?",
    choose: "अपनी भाषा चुनें और अपना सवाल पूछें।",
    select: "अपनी भाषा चुनें",
    online: "ऑनलाइन",
    welcome: "भाषासेतु में आपका स्वागत है!",
    suggestionsTitle: "इन सेवाओं के बारे में पूछें:",
    income: "आय प्रमाण पत्र",
    caste: "जाति प्रमाण पत्र",
    scholarship: "छात्रवृत्ति",
    placeholder: "किसी सरकारी सेवा के बारे में पूछें...",
    ask: "पूछें",
    loading: "जानकारी खोजी जा रही है...",
    guidance: "आवेदन करने की प्रक्रिया:",
    visit: "आधिकारिक पोर्टल पर जाएं ↗",
    disclaimer: "भाषासेतु जानकारी प्रदान करता है। आवेदन करने से पहले आधिकारिक सरकारी पोर्टल पर आवश्यकताओं की पुष्टि करें।",
    multilingual: "बहुभाषी सहायता",
    multilingualDesc: "भारतीय भाषाओं के लिए बनाया गया।",
    ai: "AI सहायता",
    aiDesc: "सरकारी सेवाओं के लिए सरल मार्गदर्शन।",
    service: "सेवा मार्गदर्शन",
    serviceDesc: "आवेदन की प्रक्रिया समझें।",
    footer: "© 2026 भाषासेतु | सरकारी सेवाओं को सभी के लिए सुलभ बनाना",
    speak: "स्वागत संदेश सुनें",
    stop: "बोलना बंद करें",
    error: "कनेक्ट नहीं हो पा रहा है। कृपया जांचें कि सर्वर चल रहा है या नहीं।"
  }
};

const welcomeMessages = {
  en: "Welcome to BhashaSetu! How can I help you today? You can ask me about government services such as income certificates, caste certificates and student scholarships.",

  kn: "ಭಾಷಾಸೇತುವಿಗೆ ಸ್ವಾಗತ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ, ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಬಹುದು.",

  hi: "भाषासेतु में आपका स्वागत है! आज मैं आपकी कैसे मदद कर सकता हूँ? आप मुझसे आय प्रमाण पत्र, जाति प्रमाण पत्र और छात्रवृत्ति जैसी सरकारी सेवाओं के बारे में पूछ सकते हैं।"
};

function App() {
  const [language, setLanguage] = useState("en");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const t = translations[language];

  // TEXT TO SPEECH USING BACKEND
  const speakText = async (text) => {
    if (!text) return;

    try {
      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/tts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: text,
            language: language
          })
        }
      );

      if (!response.ok) {
        throw new Error("Text-to-speech request failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);

      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        console.error("Audio playback failed.");
      };

      await audio.play();

    } catch (error) {
      console.error("Text-to-speech error:", error);
      alert("Unable to play voice. Please check the backend server.");
    }
  };

  // MICROPHONE INPUT
  // MICROPHONE INPUT USING WHISPER BACKEND
const startListening = async () => {

  // If already recording, stop recording
  if (mediaRecorderRef.current?.state === "recording") {
    mediaRecorderRef.current.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "";

    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : {}
    );

    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {

      setIsListening(false);
      stream.getTracks().forEach((track) => track.stop());

      try {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm"
        });

        if (audioBlob.size === 0) {
          alert("No audio recorded. Please try again.");
          return;
        }

        const formData = new FormData();

        formData.append(
          "file",
          audioBlob,
          "recording.webm"
        );

        const response = await fetch(
          `http://127.0.0.1:8000/stt?language=${language}`,
          {
            method: "POST",
            body: formData
          }
        );

        if (!response.ok) {
          throw new Error("Speech recognition failed");
        }

        const data = await response.json();

        if (data.transcript) {
          setQuestion(data.transcript);
        } else {
          alert("No speech recognized. Please try again.");
        }

      } catch (error) {
        console.error("Speech-to-text error:", error);
        alert("Unable to recognize speech. Please try again.");
      }
    };

    recorder.start();
    setIsListening(true);

  } catch (error) {
    console.error("Microphone error:", error);
    alert("Unable to access microphone. Please check permissions.");
  }
};
  // CHATBOT
  const askQuestion = async (customQuestion) => {
    const currentQuestion = customQuestion || question;

    if (!currentQuestion.trim() || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: currentQuestion
      }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: currentQuestion,
            language: language
          })
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.answer,
          service: data.service,
          steps: data.steps,
          link: data.link
        }
      ]);

      // SPEAK CHATBOT RESPONSE
      const spokenAnswer = [
        data.answer,
        ...(data.steps || [])
      ].join(". ");

      speakText(spokenAnswer);

    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: t.error
        }
      ]);

    } finally {
      setLoading(false);
    }
  };

  // STOP SPEAKING
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <span className="logo">🌐</span>
          <h1>BhashaSetu</h1>
        </div>

        <p>{t.tagline}</p>
      </header>

      <main className="container">

        {/* HERO */}
        <section className="hero">
          <span className="tag">{t.tagline}</span>

          <h2>
            {t.heading} <span>{t.headingHighlight}</span>
          </h2>

          <p>{t.subtitle}</p>
        </section>

        {/* ASSISTANT */}
        <section className="assistant">

          <div className="assistant-title">
            <div>
              <h3>{t.help}</h3>
              <p>{t.choose}</p>
            </div>

            <span className="status">
              ● {t.online}
            </span>
          </div>

          {/* LANGUAGE SELECTION */}
          <label htmlFor="language">
            {t.select}
          </label>

          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>

          {/* CHATBOX */}
          <div className="chatbox">

            {messages.length === 0 ? (

              <div className="welcome">

                <div className="welcome-icon">💬</div>

                <h3>{t.welcome}</h3>

                <p>{t.suggestionsTitle}</p>

                <div className="suggestions">

                  <button
                    onClick={() =>
                      askQuestion(
                        "How can I apply for an income certificate?"
                      )
                    }
                  >
                    {t.income}
                  </button>

                  <button
                    onClick={() =>
                      askQuestion(
                        "Tell me about caste certificate"
                      )
                    }
                  >
                    {t.caste}
                  </button>

                  <button
                    onClick={() =>
                      askQuestion(
                        "Where can students find scholarships?"
                      )
                    }
                  >
                    {t.scholarship}
                  </button>

                </div>
              </div>

            ) : (

              messages.map((message, index) => (

                <div
                  key={index}
                  className={`message ${message.type}`}
                >

                  <p>{message.text}</p>

                  {message.service && (
                    <h4>{message.service}</h4>
                  )}

                  {message.steps && (
                    <>
                      <strong>{t.guidance}</strong>

                      <ol>
                        {message.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </>
                  )}

                  {message.link && (
                    <a
                      href={message.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.visit}
                    </a>
                  )}

                </div>

              ))

            )}

            {loading && (
              <p className="loading">{t.loading}</p>
            )}

          </div>

          {/* INPUT AREA */}
          <div className="input-area">

            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && askQuestion()
              }
              placeholder={t.placeholder}
            />

            <button
              className="mic-button"
              onClick={startListening}
              disabled={loading }
              title={isListening ? "Stop recording" : "Start recording"}
            >
              {isListening ? "⏹️ Stop Recording" : "🎤"}
            </button>

            <button
              onClick={() => askQuestion()}
              disabled={loading}
            >
              {loading ? "..." : `${t.ask} →`}
            </button>

          </div>

          {/* VOICE CONTROLS */}
          <div className="voice-controls">

            <button
              className="mic-button"
              onClick={() =>
                speakText(welcomeMessages[language])
              }
            >
              🔊 {t.speak}
            </button>

            <button
              className="mic-button"
              onClick={stopSpeaking}
            >
              🔇 {t.stop}
            </button>

          </div>

          <p className="disclaimer">
            {t.disclaimer}
          </p>

        </section>

        {/* FEATURES */}
        <section className="features">

          <div>
            <span>🌍</span>
            <h3>{t.multilingual}</h3>
            <p>{t.multilingualDesc}</p>
          </div>

          <div>
            <span>🤖</span>
            <h3>{t.ai}</h3>
            <p>{t.aiDesc}</p>
          </div>

          <div>
            <span>📄</span>
            <h3>{t.service}</h3>
            <p>{t.serviceDesc}</p>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer>
        <p>{t.footer}</p>
      </footer>

    </div>
  );
}

export default App;