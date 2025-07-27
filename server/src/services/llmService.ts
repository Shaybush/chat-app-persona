import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import type { Message } from '../types';
import { env } from "../config/env";

// Environment variables for API keys
const OPENAI_API_KEY = env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// Supported models - you can easily add more!
export type SupportedModel =
  // OpenAI models
  | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  // Anthropic models  
  | 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229'
  // Google models
  | 'gemini-1.5-pro' | 'gemini-1.5-flash'
  // Mistral models
  | 'mistral-large-latest' | 'mistral-small-latest';

// Get the appropriate chat model based on the model name
function getChatModel(modelName: SupportedModel): BaseChatModel {
  if (modelName.startsWith('gpt-')) {
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');
    return new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      modelName: modelName,
      temperature: 0.7
    });
  }

  if (modelName.startsWith('claude-')) {
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
    return new ChatAnthropic({
      anthropicApiKey: ANTHROPIC_API_KEY,
      modelName: modelName,
      temperature: 0.7
    });
  }

  if (modelName.startsWith('gemini-')) {
    if (!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is not set');
    return new ChatGoogleGenerativeAI({
      apiKey: GOOGLE_API_KEY,
      model: modelName,
      temperature: 0.7
    });
  }

  if (modelName.startsWith('mistral-')) {
    if (!MISTRAL_API_KEY) throw new Error('MISTRAL_API_KEY is not set');
    return new ChatMistralAI({
      apiKey: MISTRAL_API_KEY,
      modelName: modelName,
      temperature: 0.7
    });
  }

  throw new Error(`Unsupported model: ${modelName}`);
}

/**
 * Convert our Message format to LangChain message format
 * @param messages Array of our Message objects
 * @returns Array of LangChain messages
 */
function convertToLangChainMessages(messages: Message[]) {
  return messages.map(msg => {
    if (msg.isUser) {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });
}

/**
 * Generate a persona reply with conversation history support
 * @param message Current user's message
 * @param systemPrompt System prompt for the persona
 * @param conversationHistory Previous messages in the conversation
 * @param model Model to use (defaults to gpt-3.5-turbo for fast responses)
 * @param maxHistoryLength Maximum number of previous messages to include
 * @returns Generated response
 */
export async function getPersonaReplyWithHistory(
  message: string,
  systemPrompt: string,
  conversationHistory: Message[] = [],
  model: SupportedModel = 'gpt-3.5-turbo',
  maxHistoryLength: number = 20
): Promise<string> {
  try {
    const chatModel = getChatModel(model);

    // Limit conversation history to prevent token limit issues
    const recentHistory = conversationHistory.slice(-maxHistoryLength);

    // Build message array
    const messages = [
      new SystemMessage(systemPrompt),
      // Convert and include conversation history
      ...convertToLangChainMessages(recentHistory),
      // Add current message
      new HumanMessage(message)
    ];

    const response = await chatModel.invoke(messages);

    return response.content.toString();
  } catch (error) {
    console.error(`Error with model ${model}:`, error);
    throw new Error(`Failed to get response from ${model}: ${error}`);
  }
}

/**
 * Generate a persona reply using the specified model (backwards compatibility)
 * @param message User's message
 * @param systemPrompt System prompt for the persona
 * @param model Model to use (defaults to gpt-3.5-turbo for fast responses)
 * @returns Generated response
 */
export async function getPersonaReply(
  message: string,
  systemPrompt: string,
  model: SupportedModel = 'gpt-3.5-turbo'
): Promise<string> {
  return getPersonaReplyWithHistory(message, systemPrompt, [], model);
}

/**
 * Create a formatted chat message
 * @param content Message content
 * @param isUser Whether it's from user or AI
 * @param personaId Persona identifier
 * @returns Formatted Message object
 */
export function createMessage(
  content: string,
  isUser: boolean,
  personaId?: string
): Message {
  return {
    id: `${isUser ? 'user' : 'ai'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    isUser,
    timestamp: Date.now(),
    personaId
  };
}

/**
 * Example usage showing how to use conversation history:
 * 
 * // With conversation history
 * const response = await getPersonaReplyWithHistory(
 *   "What did we discuss earlier?",
 *   "You are a helpful assistant.",
 *   previousMessages,
 *   'gpt-4-turbo'
 * );
 * 
 * // Without history (original function)
 * const response2 = await getPersonaReply(
 *   "Hello!",
 *   "You are Yoda from Star Wars.",
 *   'gpt-3.5-turbo'
 * );
 */
