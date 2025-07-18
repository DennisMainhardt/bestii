import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(
  cors({
    origin: '*', // In production, replace with your actual domain
    methods: ['GET', 'POST'],
    allowedHeaders: [
      'Content-Type',
      'x-api-key',
      'anthropic-api-key',
      'anthropic-version',
    ],
  })
);

app.use(express.json());

app.post('/api/claude', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: req.body.messages,
        system: req.body.system,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    console.log('Claude API response:', data);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
