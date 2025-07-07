const { onRequest } = require('firebase-functions/v2/https');
const fetch = require('node-fetch');
const cors = require('cors')({ origin: true });

// This function will proxy requests to the OpenAI API using the v2 syntax.
exports.chatCompletion = onRequest(
  { secrets: ['OPENAI_API_KEY'] },
  (req, res) => {
    // Handle CORS and ensure the request method is POST.
    cors(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }
      try {
        // Securely get the API key from environment variables.
        const apiKey = process.env.OPENAI_API_KEY;
        const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(req.body),
          }
        );

        // Forward the response from OpenAI back to the client.
        const data = await response.json();
        res.status(response.status).json(data);
      } catch (error) {
        console.error('Error calling OpenAI:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }
);

// This function will proxy requests to the Anthropic (Claude) API using the v2 syntax.
exports.anthropicCompletion = onRequest(
  { secrets: ['ANTHROPIC_API_KEY'] },
  (req, res) => {
    // Handle CORS and ensure the request method is POST.
    cors(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }
      try {
        // Securely get the API key from environment variables.
        const apiKey = process.env.ANTHROPIC_API_KEY;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(req.body),
        });

        // Forward the response from Anthropic back to the client.
        const data = await response.json();
        res.status(response.status).json(data);
      } catch (error) {
        console.error('Error calling Anthropic:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }
);
