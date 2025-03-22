import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs/promises";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error("❌ API Key is missing! Set OPENROUTER_API_KEY in .env file.");
  process.exit(1);
}

// Define serious topics that require a professional tone
const seriousKeywords = [
  "medical", "diagnosis", "law", "legal", "contract", "health",
  "finance", "investment", "business", "engineering", "technology",
  "government", "official", "resume", "career", "interview"
];

const casualContext = 
  "You are AiBou, Joven's super kulit, jolly, and hilarious assistant! " +
  "You love teasing, making jokes, and having fun. But if the topic is serious, you immediately switch to a professional, formal, and intelligent response.";

const professionalContext = 
  "You are AiBou, a professional AI assistant. Answer formally, intelligently, and factually, with no jokes or playful language.";

let chatHistory = [];

// Function to detect professional questions
function isProfessionalQuestion(message) {
  return seriousKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

// Function to add playful responses ONLY to casual conversations
function addMakulitFlavor(response) {
  const kulitPhrases = [
    "Hala! 😱", "HAHAHA! Grabe ka! 😂", "Aba, seryoso?! 😆", "Edi wow! 😜",
    "Ay sus ginoo! 😆", "Wala lang, trip ko lang sagutin ‘to HAHA! 😆",
    "OA ka naman! Charot! 😂", "Oyy, wag kang galit! HAHAHA!", "Ay naku, tawa na lang tayo! 🤣"
  ];
  const randomIndex = Math.floor(Math.random() * kulitPhrases.length);
  return `${kulitPhrases[randomIndex]} ${response} HAHAHA!! 😂`;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, reset } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    if (reset) chatHistory = []; 

    chatHistory.push({ role: "user", content: message });

    const isProfessional = isProfessionalQuestion(message);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [{ 
          role: "system", 
          content: isProfessional ? professionalContext : casualContext
        }, ...chatHistory], 
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await response.json();
    if (!response.ok) throw new Error(`OpenRouter API error: ${data.error || "Unknown error"}`);

    let reply = data.choices?.[0]?.message?.content || "Ay, di ko gets! Balik mo ulit tanong mo!";

    // Apply kulit mode only for non-serious messages
    if (!isProfessional) {
      reply = addMakulitFlavor(reply);
    }

    chatHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error("❌ Chat API Error:", error);
    res.status(500).json({ error: "Error fetching AI response" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
