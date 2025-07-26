import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// Environment variables for API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
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
 * Generate a persona reply using the specified model
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
  try {
    const chatModel = getChatModel(model);

    const messages = [
      new SystemMessage(systemPrompt),
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
 * Example usage showing how easy it is to switch models:
 * 
 * // Use GPT-4 Turbo
 * const response1 = await getPersonaReply(message, systemPrompt, 'gpt-4-turbo');
 * 
 * // Switch to Claude 3.5 Sonnet  
 * const response2 = await getPersonaReply(message, systemPrompt, 'claude-3-5-sonnet-20241022');
 * 
 * // Use Google Gemini
 * const response3 = await getPersonaReply(message, systemPrompt, 'gemini-1.5-pro');
 * 
 * // Use Mistral
 * const response4 = await getPersonaReply(message, systemPrompt, 'mistral-large-latest');
 */
