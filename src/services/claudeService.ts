import { SummaryMetadata } from '@/types/memory';

// Define a type for the structure of a message in a Claude API request
interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Define a type for the expected structure of the API response
interface ClaudeApiResponse {
  content: { type: string; text: string }[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  // ... other potential fields
}

const CLAUDE_PROXY_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5001/chatbot-2ff8e/us-central1/anthropicCompletion'
    : 'https://us-central1-chatbot-2ff8e.cloudfunctions.net/anthropicCompletion';

export class ClaudeService {
  private systemPrompt: string = ''; // Default system prompt

  constructor() {
    // API key is no longer needed in the frontend.
  }

  setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
  }

  private async makeRequest(
    messages: ClaudeMessage[]
  ): Promise<ClaudeApiResponse> {
    try {
      const response = await fetch(CLAUDE_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 4096,
          messages: messages,
          system: this.systemPrompt, // Include system prompt here
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Claude proxy error response:', errorBody);
        throw new Error(
          `Claude proxy request failed with status ${response.status}: ${errorBody}`
        );
      }

      const data: ClaudeApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error in makeRequest to Claude proxy:', error);
      throw error;
    }
  }

  async sendMessage(userInput: string): Promise<string> {
    const messages: ClaudeMessage[] = [{ role: 'user', content: userInput }];

    try {
      const response = await this.makeRequest(messages);
      const assistantResponse = response.content.find((c) => c.type === 'text');
      return assistantResponse
        ? assistantResponse.text
        : "I'm sorry, I couldn't process that.";
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      return 'There was an error communicating with the AI. Please try again.';
    }
  }

  async generateSummary(
    messagesToSummarize: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<{
    summary: string;
    metadata: SummaryMetadata | null;
    tokenCount?: number;
  }> {
    const summarizationPrompt = `
      Based on the following conversation, create a concise summary and extract key metadata.
      The summary should capture the main points, user feelings, and outcomes.
      The metadata should identify key people, events, emotional themes, and potential triggers.

      Conversation:
      ${messagesToSummarize
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\\n')}

      Respond ONLY with a JSON object in the following format:
      {
        "summary": "A concise summary of the conversation.",
        "metadata": {
          "key_people": ["Name1", "Name2"],
          "key_events": ["Event1", "Event2"],
          "emotional_themes": ["Theme1", "Theme2"],
          "triggers": ["Trigger1", "Trigger2"]
        }
      }
    `;

    try {
      const response = await this.makeRequest([
        { role: 'user', content: summarizationPrompt },
      ]);
      const jsonResponseText =
        response.content.find((c) => c.type === 'text')?.text || '{}';

      // Robustly parse the JSON from the response text
      let parsed = { summary: '', metadata: null };
      try {
        // Find the start and end of the JSON object
        const startIndex = jsonResponseText.indexOf('{');
        const endIndex = jsonResponseText.lastIndexOf('}') + 1;
        if (startIndex > -1 && endIndex > -1) {
          const jsonString = jsonResponseText.substring(startIndex, endIndex);
          parsed = JSON.parse(jsonString);
        } else {
          throw new Error('No valid JSON object found in the response.');
        }
      } catch (e) {
        console.error(
          'Failed to parse summary JSON:',
          e,
          'Raw response:',
          jsonResponseText
        );
        // Fallback to error summary if parsing fails
        return {
          summary: 'Error creating summary due to parsing failure.',
          metadata: null,
        };
      }

      const summary = parsed.summary || '';
      const metadata = parsed.metadata || null;

      const tokenCount = response.usage
        ? response.usage.input_tokens + response.usage.output_tokens
        : undefined;

      return { summary, metadata, tokenCount };
    } catch (error) {
      console.error('Error generating summary with Claude:', error);
      return {
        summary: 'Error creating summary.',
        metadata: null,
      };
    }
  }
}
