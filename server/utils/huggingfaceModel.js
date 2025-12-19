import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;

console.log("HF KEY:", HF_API_KEY?.slice(0, 8));

class HuggingFaceModel {
  async generateContent(prompt, options = {}) {
    try {
      const response = await axios.post(
        "https://router.huggingface.co/novita/v3/openai/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: options.max_tokens || 300,
          temperature: options.temperature || 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        response: {
          text: async () => response.data.choices[0].message.content,
        },
      };
    } catch (err) {
      console.error(
        "HuggingFace API Error:",
        err.response?.data || err.message
      );
      throw new Error("AI generation failed");
    }
  }
}

export const model = new HuggingFaceModel();
