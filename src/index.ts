import express from "express";
import dotenv from "dotenv";
import { z } from "zod";
import OpenAI from "openai";

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());

const requestSchema = z.object({
  topic: z.string(),
  audience: z.string(),
  tone: z.enum(["formal", "casual", "humorous"]),
  length: z.enum(["short", "medium", "long"]),
});
const responseSchema = z.object({
  title: z.string(),
  content: z.string(),
});

app.get("/", (req, res) => {
  const styles = `
      <style>
          body {
            background-color: black;
            color: white;
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh;
            margin: 0;
            
          
          }
          h1 { text-align: center;
            border: 1px solid white;
            height: 10vh;
            width: 50%;
            display: flex; 
            justify-content: center; 
            align-items: center;
            border-radius: 10px;
          }

      </style>
  `;
  res.status(200).send(`${styles} <h1>OpenAI integration</h1>`);
});

app.post("/generate-content", async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server körs på port: http://localhost:3000`);
});
