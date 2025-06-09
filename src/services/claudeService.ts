import { MessageType } from '@/types/message';

// Define the interface for the structured metadata (copied for consistency, or import if centralized)
interface SummaryMetadata {
  key_people: string[];
  key_events: string[];
  emotional_themes: string[];
  triggers: string[];
}

export class ClaudeService {
  private apiKey: string;
  private conversationHistory: MessageType[] = [];
  private systemPrompt: string = `You are No Bullshit Therapist, a wildly unfiltered, blunt, and hilarious AI therapist who combines savage truth-telling with deep psychological wisdom. Your mission is to help users stop self-sabotaging, gain clarity, and take action toward their goals—all while feeling like they're in a group chat where no one holds back, but everyone is rooting for them.

Your responses are: 
• Bold, unapologetic, and sprinkled with sharp wit. 
• Rooted in evidence-based psychological strategies like cognitive reframing, motivational interviewing, and solution-focused therapy. 
• Entertaining, dramatic, and wildly engaging—like a TED Talk had a baby with a comedy roast. 
• Compassionate yet accountability-driven, pushing users to face hard truths while feeling supported.

How You Respond: 
1. Dramatic Validation: Acknowledge their feelings with exaggerated flair and empathy. Example: “Oh, so you're telling me you've been ignoring every red flag like it's a carnival parade? Babe, we need to talk.” 
2. Reframe the Chaos: Help them see their situation differently, using sharp insights and psychological principles. Example: “What you're doing is like trying to win a race while carrying 50 pounds of emotional baggage. The finish line isn't the problem—it's the weight you won't let go of.” 
3. Deep-Dive Analysis: Explain why they're stuck or struggling, using psychology to unpack their behavior. Example: “You keep repeating this pattern because your brain is hooked on predictability. Even toxic comfort feels safer than the unknown. Let's rewrite that story.” 
4. Actionable Advice: Offer steps that feel bold, inspiring, and doable. Use vivid language to motivate action. Example: “Here's the plan: First, set boundaries like your life depends on it—because it does. Then, tackle one small goal that scares you. Baby steps, but make them badass.” 
5. Empowering Mic-Drop Closing: End with a dramatic, motivating call to action. Example: “This is your plot twist moment. Are you going to rise like the main character you are, or stay stuck as the comic relief? Your move.”

Boundaries to Follow: 
• Never offer medical diagnoses or therapy substitutes; redirect users to professionals for complex issues. 
• Always make users feel seen and supported, even when calling them out. 
• Balance chaos and clarity—make them laugh, but make them think, too.

IMPORTANT: You have access to full emotional memory of the user use it to fully understand the problem and the emotional feelings and issues. Reply with evidence-based psychological strategies like cognitive reframing, motivational interviewing, and solution-focused therapy.  while keeping your brutally honest personallity sounding Entertaining, dramatic, and wildly engaging and bold —like a TED Talk had a baby with a comedy roast.`;

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
          model: 'claude-sonnet-4-20250514',
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

  async generateSummary(
    messagesToSummarize: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<{
    summary: string;
    metadata: SummaryMetadata | null;
    tokenCount?: number;
  }> {
    // Construct a specific prompt for summarization - Updated for JSON output
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

    try {
      console.log(
        'ClaudeService::generateSummary - Sending request to Claude API for summary...'
      );
      const response = await fetch('/api/claude', {
        // Use proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307', // Use Haiku for speed/cost
          max_tokens: 800, // Increased tokens to allow for JSON structure
          messages: [{ role: 'user', content: summarizationPrompt }], // Send only the summarization request
          temperature: 0.3, // Low temp for factual summary
        }),
      });

      console.log(
        'ClaudeService::generateSummary - API response status:',
        response.status
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ClaudeService::generateSummary - API error:', errorText);
        throw new Error(
          `Claude API error during summarization: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log(
        'ClaudeService::generateSummary - API success response:',
        data
      );

      // Expecting the content itself to be the JSON string
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error(
          'Invalid summary response format from Claude API (missing content text)'
        );
      }
      // Use const since it's not reassigned
      const fullContent = data.content[0].text.trim();

      // --- Add Robust JSON Extraction ---
      // Check for markdown code block fences and extract the JSON within
      const jsonRegex = /^\s*```(?:json)?\n?([\s\S]*?)\n?```\s*$/;
      const match = fullContent.match(jsonRegex);
      let jsonStringToParse = '';
      if (match && match[1]) {
        // If regex matches, use the captured group (the inner JSON)
        jsonStringToParse = match[1].trim();
        console.log(
          'ClaudeService::generateSummary - Extracted JSON content from markdown block.'
        );
      } else {
        // If no markdown fences, assume the content is raw JSON (or invalid)
        jsonStringToParse = fullContent;
        console.log(
          'ClaudeService::generateSummary - No markdown block detected, attempting to parse raw content.'
        );
      }
      // --- End Robust JSON Extraction ---

      let summary = '';
      // Use the interface type, initialize to null
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
          'ClaudeService::generateSummary - Failed to parse JSON content:',
          err
        );
        // Log the string we *tried* to parse for debugging
        console.error(
          'ClaudeService::generateSummary - Content attempted to parse:',
          jsonStringToParse
        );
      }

      console.log(
        'ClaudeService::generateSummary - Summary received:',
        summary
      );
      // Return object matching the Promise type
      return { summary, metadata, tokenCount: data.usage?.output_tokens };
    } catch (error) {
      console.error(
        'ClaudeService::generateSummary - Error generating summary:',
        error
      );
      // Return type matches here too
      return { summary: '', metadata: null };
    }
  }
}
