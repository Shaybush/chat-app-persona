import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function getPersonaReply(message: string, systemPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const chat = new ChatOpenAI({ openAIApiKey: OPENAI_API_KEY, modelName: "gpt-3.5-turbo" });

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(message),
  ];

  const response = await chat.invoke(messages);

  return response.content.toString();
}
