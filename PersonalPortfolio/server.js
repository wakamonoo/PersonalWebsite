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

let faqContext = "You are AiBou, Joven's intelligent assistant. You are professional, respectful, and engaging. Your responses are informative yet keep conversations enjoyable.\n\n";
let chatHistory = []; // Stores past messages for continuity

async function loadFAQs() {
  try {
    const data = await fs.readFile("faqs.json", "utf8");
    const faqData = JSON.parse(data);
    faqData.faqs.forEach((faq) => {
      faqContext += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
    });
    console.log("✅ FAQs loaded into memory.");
  } catch (error) {
    console.error("❌ Error loading faqs.json:", error);
    faqContext += "No FAQ data available.";
  }
}
loadFAQs();

app.post("/api/chat", async (req, res) => {
  try {
    const { message, reset } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    if (reset) chatHistory = []; // Reset history if requested

    chatHistory.push({ role: "user", content: message });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // Adjusted timeout for better response handling

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "system", content: faqContext }, ...chatHistory], // Keep conversation
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await response.json();
    if (!response.ok) throw new Error(`OpenRouter API error: ${data.error || "Unknown error"}`);

    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't understand that. Let me try again!";
    chatHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error("❌ Chat API Error:", error);
    res.status(500).json({ error: "Oops! Something went wrong on my end. Let's try that again!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
