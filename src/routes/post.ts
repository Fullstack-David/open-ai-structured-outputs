import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import dotenv from "dotenv";

const router = Router();

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const requestSchema = z.object({
  topic: z.string(),
  audience: z.enum(["student", "professional", "general"]),
  tone: z.enum(["formal", "casual", "humorous"]),
  length: z.enum(["short", "medium", "long"]),
});

const responseSchema = z.object({
  title: z.string(),
  content: z.string(),
});

router.post("/generate-content", async (req, res) => {
  try {
    const { topic, audience, tone, length } = requestSchema.parse(req.body);
    const prompt = `Skriv ett inlägg på ${length} ord om ${topic} för en ${audience} som talar ${tone}. Formatera svaret som JSON med fälten "title" och "content".`;
    const systemPrompt =
      "Du är en hjälpsam assistent som skriver inlägg för sociala medier. Svara alltid med JSON-formaterad text som innehåller fälten 'title' och 'content'.";
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const generatedContent = JSON.parse(
      completion.choices[0].message.content || "{}"
    );
    const validatedContent = responseSchema.parse(generatedContent);
    console.log(validatedContent);
    res.json({ generatedContent: validatedContent });
  } catch (error) {
    console.error("Ett fel har inträffat:", error);
    res.status(500).json({ error: "Ett internt serverfel inträffade" });
  }
});

export default router;
