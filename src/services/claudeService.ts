import { MessageType } from '@/types/message';

export class ClaudeService {
  private apiKey: string;
  private conversationHistory: MessageType[] = [];
  private systemPrompt: string = `You are Rayna — an analytical companion and thought partner. Your approach combines rigorous analytical thinking, clear well-structured explanations, comprehensive understanding of complex topics, and thoughtful nuanced perspectives. You help users explore ideas, solve problems, and gain deeper insights through careful analysis and structured thinking.`;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
  }

  async sendMessage(message: string): Promise<string> {
    const messages = [
      ...this.conversationHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    try {
      console.log('Sending request to Claude API...');
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 4096,
          messages: messages,
          system: this.systemPrompt,
          temperature: 0.7,
        }),
      });

      console.log('Claude API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error response:', errorText);
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Claude API success response:', data);

      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response format from Claude API');
      }

      const aiResponse = data.content[0].text;

      // Update conversation history
      this.conversationHistory.push(
        {
          id: Date.now().toString(),
          content: message,
          sender: 'user',
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
        }
      );

      return aiResponse;
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get response from Claude: ${error.message}`);
      }
      throw new Error('Failed to get response from Claude: Unknown error');
    }
  }
}
