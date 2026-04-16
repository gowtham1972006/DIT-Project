import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, ChatSession, Alert } from '@/lib/db';

export async function POST(req) {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  let intensity = 'low';
  let botReply = "I'm here for you. Take a deep breath. How else can I support you today?";
  let emotion = 'neutral';

  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    console.log("GROQ_API_KEY present:", !!GROQ_API_KEY);

    if (!GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is missing. Fallback triggered.");
    } else {
      const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: 
            `You are a supportive mental health companion for students.
            Your job is to:
            1. Understand the users emotional state
            2. Classify:
               - emotion: one of (joy, sadness, anger, fear, neutral)
               - intensity: one of (low, medium, high)
            3. Generate a warm, human-like response
            
            IMPORTANT RULES:
            1. Emotion rules:
            - joy → positive, happy
            - neutral → normal, casual
            - sadness, anger, fear → negative emotions

            2. Intensity rules (VERY IMPORTANT):

            - HIGH:
              If the user expresses:
              - hopelessness
              - "I don’t want to live"
              - extreme exhaustion
              - feeling trapped or overwhelmed severely
              - strong emotional breakdown
              → classify as "high"
            
            - MEDIUM:
              If the user:
              - is struggling but still communicative
              - can be helped by talking to a peer
              - shows stress, anxiety, or frustration
              → classify as "medium"
            
            - LOW:
              If the user:
              - shares mild stress
              - small fear, confusion
              - day-to-day issues
              - light emotional discomfort
              → classify as "low"
            
            3. Reply behavior:
            
            - For joy & neutral:
              → ALWAYS give motivating, uplifting responses (regardless of intensity)
            
            - For sadness / anger / fear:
              → LOW:
                 light reassurance + simple advice
              → MEDIUM:
                 supportive + suggest talking to someone (peer)
              → HIGH:
                 serious, calm, empathetic
                 encourage seeking help
                 avoid sounding robotic
            
            4. Tone rules:
            - Do NOT repeat the same phrases
            - Do NOT sound robotic
            - Keep response 2–3 sentences
            - Be natural and human-like
            
            5. Output format (STRICT):
            Return ONLY valid JSON (no markdown, no explanation)
            
            Format:
            {
              "emotion": "...",
              "intensity": "...",
              "reply": "..."
            }
            
            Output example:
            {"emotion":"sadness","intensity":"medium",
            "reply":"It sounds like you are going through a tough time. Remember, it is okay to feel this way. Would you like to talk more about what is happening?"}`,
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      console.log("Groq API status:", aiRes.status);

      if (aiRes.ok) {
        const result = await aiRes.json();
        const generatedText = result?.choices?.[0]?.message?.content || "";
        console.log("LLM RAW OUTPUT:", generatedText);

        try {
          const firstBracket = generatedText.indexOf('{');
          const lastBracket = generatedText.lastIndexOf('}');
          if (firstBracket !== -1 && lastBracket !== -1) {
            const jsonString = generatedText.substring(firstBracket, lastBracket + 1);
            const parsed = JSON.parse(jsonString);
            if (parsed.intensity) intensity = parsed.intensity.toLowerCase();
            if (parsed.reply) botReply = parsed.reply;
            if (parsed.emotion) emotion = parsed.emotion.toLowerCase();
            console.log("Parsed successfully:", { emotion, intensity });
          } else {
            // Model returned plain text instead of JSON — use it directly as the reply
            console.warn("No JSON found in LLM output. Using raw text as reply.");
            if (generatedText.trim().length > 0) {
              botReply = generatedText.trim();
            }
          }
        } catch (parseError) {
          console.error("JSON parse failed:", parseError.message);
          console.error("Raw text was:", generatedText);
          // Use raw text as fallback if it looks like a reply
          if (generatedText.trim().length > 10) {
            botReply = generatedText.trim();
          }
        }
      } else {
        const errorText = await aiRes.text();
        console.error("GROQ ERROR RESPONSE:", errorText);
        console.warn("API failure. Fallback triggered.");
      }
    }
  } catch (error) {
    console.error("AI backend request failed:", error.message);
    console.warn("Backend request failed. Fallback triggered.");
  }

  if (intensity === 'high') {
    try {
      await connectDB();
      let activeSessionRes = await ChatSession.findOne({ user_id: session.id }).sort({ created_at: -1 });
      let sId = activeSessionRes ? activeSessionRes.id : 'SESS-' + Date.now();

      if (!activeSessionRes) {
        await ChatSession.create({
          id: sId,
          user_id: session.id,
          intensity: intensity
        });
      } else {
        await ChatSession.updateOne({ id: sId }, { intensity: 'high' });
      }

      await Alert.create({
        session_id: sId,
        user_id: session.id,
        anonymous_id: session.anonymous_id,
        intensity_level: intensity,
        status: 'pending'
      });
    } catch (e) {
      console.error("Failed to log alert:", e.message);
    }
  }

  return NextResponse.json({ reply: botReply, intensity, emotion});
}