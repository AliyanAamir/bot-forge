import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const AVAILABLE_MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Versatile)" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Fast)" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", label: "Gemma 2 9B" },
] as const;

export type GroqModel = (typeof AVAILABLE_MODELS)[number]["id"];
