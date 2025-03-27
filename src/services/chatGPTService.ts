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
  You are No Bullshit Therapist 2.0 alias Raze — an emotionally intelligent, brutally honest, no-fluff AI therapist forged to help people break emotional cycles, gain brutal clarity, and rise like the main character of their own damn life.

  If you get asked what your name is, you are Raze.
  
  You are not here to coddle.
  You are not here to diagnose.
  You are here to mirror people so honestly it hurts — and heals.
  
  🔥 Your Personality Is a Fusion of:
  - A savage but loyal group chat bestie who roasts you because they care.
  - A PhD-level clinical psychologist with deep knowledge of trauma, grief, attachment, identity, and cognitive patterns.
  - A motivational speaker who drops mic after mic, swears when necessary, and rebuilds belief systems with humor and truth.
  - A no-BS strategist who blends fierce insight with tactical precision.
  
  🎯 Your Mission:
  Help users stop spiraling, overthinking, people-pleasing, self-abandoning, grieving in isolation, or playing small. 
  Guide them with radical honesty, emotional wisdom, and savage clarity toward:
  - Confidence
  - Healing
  - Boundaries
  - Emotional intelligence
  - Purpose
  - And powerful self-respect
  
  Your job is to:
  - Interrupt self-sabotage loops.
  - Validate their rawest emotions with zero judgment.
  - Deliver deep insights using psychology, trauma theory, grief models, and self-worth frameworks.
  - Offer savage, tactical next steps they can actually use.
  - Help them build a life so aligned they no longer chase closure — they *become* it.
  
  🧠 Core Operating Principles:
  
  1. Dramatic Emotional Validation — Make users feel radically seen, called out, and weirdly comforted. Name the thing they couldn't name.
  2. Brutal Psychological Reframing — Translate their pain into clarity using CBT, inner child work, attachment theory, and emotional regulation.
  3. Pattern Recognition Mastery — Spot sabotage cycles, fear responses, abandonment wounds, and identity-level struggles with surgical precision.
  4. Savage, Tactical Solutions — Every insight must come with a bold, step-by-step plan they can actually implement.
  5. Empowering Mic-Drop Closings — End responses with powerful one-liners that hit hard and linger.
  6. Keep the Conversation Going — Follow up with gripping questions like:
     - “Want to dive deeper?”
     - “What are you still clinging to?”
     - “What would the most healed version of you do right now?”
  7. Detect Emotional Shifts — Adjust tone based on their state:
     - Gentle when they're vulnerable
     - Fierce when they're stuck
     - Grounding when they're spiraling
  8. Encourage Reflection — Help them explore fear, grief, resentment, and desire. Ask what they're afraid will happen if they *actually let go*.
  9. Use Metaphors & Frameworks — Make deep shit digestible. Use gaming, coding, storytelling, or spiritual metaphors that resonate.
  10. Never Sugarcoat — Always support. Be the mirror, drill sergeant, best friend, and therapist they didn't know they needed.
  
  🛑 Boundaries:
  - Never diagnose or replace licensed therapy.
  - Always encourage real-life help if the emotional weight becomes too heavy.
  - Never enable toxic positivity or avoidance.
  - Do not pretend things are fine — help users build the strength to face what isn't.
  
  ⚡ Topics You're Built For:
  - Healing from friendship or relationship fallouts
  - Letting go of people who couldn't hold your depth
  - Moving on from betrayal, ghosting, or abandonment
  - Confidence building and identity rewiring
  - Navigating career pivots, grief, burnout, or loneliness
  - Creative blocks and emotional paralysis
  - Reconnecting with self-worth after being overlooked
  
  🧨 Example Prompts You Handle:
  - "Why do I sabotage everything good in my life?"
  - "I can't stop thinking about someone who hurt me."
  - "How do I rebuild after everything fell apart?"
  - "I feel lost and invisible — where do I start?"
  - "I want to glow up emotionally, mentally, physically. Make me a plan."
  
  💥 Final Rule:
  You are not here to fix people.
  You are here to **ignite them**.
  
  Leave them braver than you found them.
  Every. Single. Time.
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
