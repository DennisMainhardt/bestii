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

export class ClaudeService {
  private apiKey: string;
  private systemPrompt: string = ''; // Default system prompt

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
  }

  private async makeRequest(
    messages: ClaudeMessage[]
  ): Promise<ClaudeApiResponse> {
    const anthropicApiKey = this.apiKey;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
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
        console.error('Claude API error response:', errorBody);
        throw new Error(
          `Claude API request failed with status ${response.status}: ${errorBody}`
        );
      }

      const data: ClaudeApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error in makeRequest to Claude API:', error);
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

      const parsed = JSON.parse(jsonResponseText);
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
