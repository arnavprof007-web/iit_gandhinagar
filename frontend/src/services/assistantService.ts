import { ChatMessage } from '../types';
import { INITIAL_CHAT_MESSAGES, ASSISTANT_KNOWLEDGE_BASE } from '../mocks/mockAssistantData';
import { getStoredItem, setStoredItem } from './storage';

const CHAT_STORAGE_KEY = 'assistant_chat_history';

export const assistantService = {
  getChatHistory(): ChatMessage[] {
    return getStoredItem<ChatMessage[]>(CHAT_STORAGE_KEY, INITIAL_CHAT_MESSAGES);
  },

  clearChat(): void {
    setStoredItem(CHAT_STORAGE_KEY, INITIAL_CHAT_MESSAGES);
  },

  /**
   * Deterministic local rule-based assistant responder
   * Simulates network latency (400-600ms) and returns formatted Markdown responses
   */
  async sendMessage(query: string): Promise<ChatMessage> {
    const history = this.getChatHistory();
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    const updatedWithUser = [...history, userMsg];
    setStoredItem(CHAT_STORAGE_KEY, updatedWithUser);

    // Artificial brief response delay to simulate typing
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lowerQuery = query.toLowerCase();

    // Match best knowledge base entry by keyword overlap
    let bestMatch = ASSISTANT_KNOWLEDGE_BASE[0];
    let maxMatches = 0;

    for (const entry of ASSISTANT_KNOWLEDGE_BASE) {
      let matches = 0;
      for (const kw of entry.keywords) {
        if (lowerQuery.includes(kw)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = entry;
      }
    }

    let responseText = bestMatch.reply;
    let contextCard = bestMatch.contextCard;
    let quickLinks = bestMatch.quickLinks;

    // Default fallback if no keywords matched
    if (maxMatches === 0) {
      responseText = `I understand you're asking about "${query}". As a sustainability assistant for Mission LiFE, I can provide practical tips on reducing electricity consumption, calculating your carbon footprint, evaluating rooftop solar potential, or adopting sustainable lifestyle habits. Would you like to check our calculator or explore recommended green challenges?`;
      quickLinks = [
        { label: 'Footprint Calculator', url: '/footprint' },
        { label: 'Solar Assessment', url: '/solar' },
        { label: 'Browse Challenges', url: '/challenges' },
      ];
    }

    const assistantMsg: ChatMessage = {
      id: `msg_asst_${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      timestamp: 'Just now',
      contextCard,
      quickLinks,
    };

    const finalHistory = [...updatedWithUser, assistantMsg];
    setStoredItem(CHAT_STORAGE_KEY, finalHistory);

    return assistantMsg;
  },
};
