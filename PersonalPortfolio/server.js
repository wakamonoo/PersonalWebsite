import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs/promises"; // Use async fs for better performance

dotenv.config();

const app = express();
app.use(cors({ origin: "*" })); // Ensure requests from any frontend are allowed
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error("❌ API Key is missing! Set OPENROUTER_API_KEY in .env file.");
  process.exit(1);
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    let faqContext = "You are Waka-AI, Joven's intelligent assistant. Use the following FAQs to answer the user's question:\n\n";
    try {
      const data = await fs.readFile("faqs.json", "utf8");
      const faqData = JSON.parse(data);
      faqData.faqs.forEach((faq) => {
        faqContext += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      });
    } catch (faqError) {
      console.error("❌ Error loading faqs.json:", faqError);
      faqContext += "No FAQ data available.";
    }

    // Send request to OpenRouter AI
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          { role: "system", content: faqContext },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${data.error || "Unknown error"}`);
    }

    res.json({ reply: data.choices?.[0]?.message?.content || "I'm sorry, I couldn't understand that." });
  } catch (error) {
    console.error("❌ Chat API Error:", error);
    res.status(500).json({ error: "Error fetching AI response" });
  }
});

// Vercel expects serverless functions
export default app;
