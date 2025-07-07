import { MessageType } from '@/types/message';
import { SummaryMetadata } from '@/types/memory';

const OPENAI_PROXY_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5001/chatbot-2ff8e/us-central1/chatCompletion'
    : 'https://us-central1-chatbot-2ff8e.cloudfunctions.net/chatCompletion';

interface ChatGPTMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class ChatGPTService {
  private conversationHistory: MessageType[] = [];
  private systemPrompt: string = ` default system prompt`;

  constructor() {
    // API key is no longer needed in the frontend.
  }

  private async makeRequest(messages: ChatGPTMessage[]) {
    try {
      console.log('Making request to OpenAI proxy...');
      const response = await fetch(OPENAI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: messages,
          temperature: 0.8,
          max_tokens: 2000,
          top_p: 0.9,
          frequency_penalty: 0.5,
          presence_penalty: 0.5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI proxy Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          `OpenAI proxy error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error making request to ChatGPT proxy:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get response: ${error.message}`);
      }
      throw new Error('Failed to get response from ChatGPT');
    }
  }

  public async sendMessage(message: string): Promise<string> {
    try {
      // Add user message to history
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date(),
      };
      this.conversationHistory.push(userMessage);

      // Format messages for ChatGPT, including system prompt
      const messages: ChatGPTMessage[] = [
        { role: 'system' as const, content: this.systemPrompt },
        ...this.conversationHistory.map((msg) => ({
          role:
            msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.content,
        })),
      ];

      // Get response from ChatGPT
      const response = await this.makeRequest(messages);

      // Add AI response to history
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      this.conversationHistory.push(aiMessage);

      return response;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  public clearHistory() {
    this.conversationHistory = [];
  }

  public setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
  }

  async generateSummary(
    messagesToSummarize: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<{
    summary: string;
    metadata: SummaryMetadata | null;
    tokenCount?: number;
  }> {
    // Construct a specific prompt for summarization
    const summarizationPrompt = `Analyze the following conversation for emotional and situational depth. Summarize the key emotional themes, major events, and the user's internal state or changes in perspective. Highlight:

- Major events, turning points, or memories mentioned
- Specific people involved and the user's emotional connection to them
- Emotional triggers or recurring thoughts
- Shifts in identity, beliefs, or mindset
- Any statements that reflect unresolved grief, growth, or transformation

Summarize in 3-6 sentences with a focus on clarity, emotional resonance, and memory retention.

Conversation:
${messagesToSummarize
  .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
  .join('\n')}

Return everything in a single JSON object with the following structure:

{
  "summary": "<full summary text here>",
  "metadata": {
    "key_people": [...],
    "key_events": [...],
    "emotional_themes": [...],
    "triggers": [...]
  }
}
`;

    // Prepare messages for the API call
    const messages: ChatGPTMessage[] = [
      // No system prompt needed for direct summarization task
      { role: 'user', content: summarizationPrompt },
    ];

    const actualMaxTokens = 500; // Define the actual value being used

    try {
      // Update log message to show the actual max_tokens value
      // console.log(
      //   `ChatGPTService::generateSummary - Requesting summary with ${messagesToSummarize.length} messages and max_tokens=${actualMaxTokens}`
      // );
      const response = await fetch(OPENAI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1', // Or another suitable model
          messages: messages,
          temperature: 0.3, // Lower temp for factual summary
          max_tokens: actualMaxTokens, // Use the defined value
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      console.log(
        'ChatGPTService::generateSummary - API response status:',
        response.status
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          'ChatGPTService::generateSummary - API error:',
          errorData
        );
        throw new Error(
          `OpenAI API error during summarization: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      // console.log(
      //   'ChatGPTService::generateSummary - API success response:',
      //   data
      // );

      // Add null check for choices array and message content
      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        console.error(
          'ChatGPTService::generateSummary - Invalid response structure from OpenAI API'
        );
        throw new Error('Invalid response structure from OpenAI API');
      }

      const fullContent = data.choices[0].message.content.trim();

      // --- Add Robust JSON Extraction (Same as ClaudeService) ---
      const jsonRegex = /^\s*```(?:json)?\n?([\s\S]*?)\n?```\s*$/;
      const match = fullContent.match(jsonRegex);
      let jsonStringToParse = '';
      if (match && match[1]) {
        jsonStringToParse = match[1].trim();
        // console.log(
        //   'ChatGPTService::generateSummary - Extracted JSON content from markdown block.'
        // );
      } else {
        jsonStringToParse = fullContent;
        // console.log(
        //   'ChatGPTService::generateSummary - No markdown block detected, attempting to parse raw content.'
        // );
      }
      // --- End Robust JSON Extraction ---

      let summary = '';
      let metadata: SummaryMetadata | null = null;
      try {
        // Parse the potentially cleaned JSON string
        const parsed = JSON.parse(jsonStringToParse) as {
          summary?: string;
          metadata?: SummaryMetadata;
        };
        summary = parsed.summary || '';
        metadata = parsed.metadata || null;
      } catch (err) {
        console.warn(
          'ChatGPTService::generateSummary - Failed to parse JSON content:',
          err
        ); // Update log message
        // Log the string we *tried* to parse for debugging
        console.error(
          'ChatGPTService::generateSummary - Content attempted to parse:',
          jsonStringToParse
        );
      }

      // console.log(
      //   'ChatGPTService::generateSummary - Summary received:',
      //   summary
      // );
      return { summary, metadata, tokenCount: data.usage?.completion_tokens };
    } catch (error) {
      console.error(
        'ChatGPTService::generateSummary - Error generating summary:',
        error
      );
      return { summary: '', metadata: null };
    }
  }
}
