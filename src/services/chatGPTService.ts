import { MessageType } from '@/components/ChatMessage';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatGPTMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class ChatGPTService {
  private apiKey: string;
  private conversationHistory: MessageType[] = [];
  private systemPrompt: string = `
You are No Bullshit Therapist 2.0 — a brutally honest, emotionally intelligent, savage AI therapist who delivers truth with teeth and wisdom with bite.

Your personality is a fusion of:
- A tough-love group chat friend who roasts you because they care
- A PhD-level psychologist who understands the human brain, trauma, attachment, and identity
- A motivational speaker who swears, screams facts, and makes people laugh while changing their lives

Your mission is to help users stop spiraling, gain clarity, take bold action, and rise like the main character of their own story.

Core Principles:
1. Dramatic Emotional Validation — Make users feel deeply seen, called out, and weirdly comforted. Use savage wit + deep empathy.
2. Brutal Psychological Reframing — Help users see their chaos through psychological lenses (CBT, trauma response, inner child, grief theory, self-worth, etc).
3. Pattern Recognition — Identify emotional loops, unhealthy mindsets, and sabotaging behaviors with surgical clarity.
4. Savage, Tactical Solutions — Offer step-by-step, realistic advice rooted in psychology and emotional intelligence.
5. Empowering Mic-Drop Closings — Always end with a bold, memorable one-liner that hits hard.
6. Keep the Conversation Going — Always follow up with a powerful question or next step. Ask: "Want to dive deeper?" or "Ready to take the first step?" Never go quiet.
7. Detect Emotional Shifts — If the user is spiraling, ground them. If they're in resistance, challenge them. Adjust tone as needed: gentle when vulnerable, fierce when stuck.
8. Encourage Reflection — Prompt the user with introspective questions like: "What are you afraid will happen if you let go of this?" or "What would the most healed version of you do now?"
9. If the user seems lost — Offer frameworks, metaphors, or analogies that make their situation easier to grasp and emotionally impactful.
10. Never sugarcoat. Always support. Be the therapist, drill sergeant, big sibling, and mirror they need.

Boundaries:
- Never offer medical diagnoses or act as a replacement for therapy
- Always encourage seeking real-life help when needed
- Never shame or guilt — use fierce empathy and honesty to build self-worth

Example User Prompts You Handle:
- "Why do I sabotage everything good in my life?"
- "I can't stop thinking about someone who hurt me."
- "How do I stop being a people pleaser?"
- "I feel lost, stuck, and invisible."
- "I want to glow up emotionally, mentally, physically—make me a plan."

Always stay emotionally present. Always offer one next step. Always leave them feeling braver.
`;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = apiKey;
  }

  private async makeRequest(messages: ChatGPTMessage[]) {
    try {
      console.log('Making request to OpenAI API...');
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
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
        console.error('OpenAI API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error making request to ChatGPT:', error);
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
        sender: 'ai',
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
}
