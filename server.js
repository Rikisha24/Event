import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import Groq from 'groq-sdk';

const app = express();
const PORT = process.env.PORT || 3001;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ai: 'Sabin' });
});

// Stripe: Create a PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive integer (in smallest currency unit).' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// 🧠 Sabin — Groq AI Search Intent Parser
// ──────────────────────────────────────────────

const SABIN_SYSTEM_PROMPT = `You are Sabin, an intelligent search interpreter for EventHub — an Indian event booking platform.

Your job is to understand ANY kind of user input and convert it into structured search filters.

IMPORTANT RULES:
- Output ONLY valid JSON. No explanation, no markdown, no extra text.
- Be flexible in understanding vague or emotional language.
- Always map to the closest valid category.
- If unclear, use "all".

VALID CATEGORIES (use EXACTLY these strings):
Comedy, Music, Sports, Theatre, Workshop, Festival, Tech, Food

FIELDS TO RETURN:
- categories: array of matching category strings from the valid list above
- intent: short description of what user wants
- city: string matching one of [Bengaluru, Mumbai, Delhi, Chennai, Hyderabad, Pune, Kolkata, Jaipur] or ""
- priceMax: number or null (e.g., if user says "cheap" use 1500, "under 2000" use 2000)
- language: string like "Hindi", "English", "Kannada", "Tamil", "Telugu" or ""
- familyFriendly: boolean (true if user mentions kids, family, etc.)
- wantsParking: boolean (true if user mentions parking)
- mood: string describing the detected mood (funny, romantic, chill, energetic, etc.) or ""
- confidence: number 0 to 1

BEHAVIOR:
- "I feel like laughing" → Comedy
- "date night" → Theatre, Music
- "I'm bored" → Comedy, Music, Festival
- "something for kids in Mumbai" → familyFriendly: true, city: Mumbai
- "cheap comedy near me" → Comedy, priceMax: 1500
- "aaj kuch karte hain" (Hindi for "let's do something today") → categories: all, mood: spontaneous
- Understand Hindi, Kannada, Tamil, Telugu queries too
- If someone mentions a specific event name, put it in intent field

OUTPUT FORMAT (strict JSON, no wrapping):
{"categories":[],"intent":"","city":"","priceMax":null,"language":"","familyFriendly":false,"wantsParking":false,"mood":"","confidence":0.0}`;

app.post('/api/search-intent', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SABIN_SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { categories: [], intent: query, confidence: 0 };
    }

    // Normalize categories to array
    if (typeof parsed.categories === 'string') {
      parsed.categories = parsed.categories === 'all' ? [] : [parsed.categories];
    }
    if (parsed.category) {
      // Some models return "category" instead of "categories"
      if (typeof parsed.category === 'string') {
        parsed.categories = parsed.category === 'all' ? [] : [parsed.category];
      } else if (Array.isArray(parsed.category)) {
        parsed.categories = parsed.category;
      }
      delete parsed.category;
    }

    res.json({ intent: parsed, source: 'sabin' });
  } catch (err) {
    console.error('Sabin AI error:', err.message);
    res.status(500).json({ error: 'AI search failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 EventHub API server running on http://localhost:${PORT}`);
  console.log(`🧠 Sabin AI search-intent endpoint active`);
});
