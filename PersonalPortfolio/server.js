import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Load FAQs from JSON file
    let faqContext = "You are Waka-AI, Joven's intelligent assistant.\n\n";
    try {
      const data = await fs.readFile("faqs.json", "utf8");
      const faqData = JSON.parse(data);
      faqContext += faqData.faqs
        .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}\n`)
        .join("\n");
    } catch (faqError) {
      console.warn(
        "⚠️ Warning: faqs.json not found or invalid, skipping FAQ context."
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
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
      }
    );
    
    const data = await response.json();
    console.log("🔍 OpenRouter API Response:", JSON.stringify(data, null, 2)); // Debugging log
    
    if (!response.ok || !data.choices || !data.choices.length) {
      throw new Error(`OpenRouter API error: ${data.error || "No valid response"}`);
    }
    
    const aiReply = data.choices[0]?.message?.content?.trim();
    
    res.json({
      reply: aiReply || "I'm sorry, I couldn't understand that.",
    });
    
  } catch (error) {
    console.error("❌ Chat API Error:", error);
    res.status(500).json({ error: "Error fetching AI response" });
  }
});

// Use Render's assigned port
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
