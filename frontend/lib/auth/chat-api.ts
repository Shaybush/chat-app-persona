import { APIResponse, SendMessageRequest, SendMessageResponse } from "@/types";
import { ApiClient } from "./api";

class ChatApiClient extends ApiClient {
    constructor() {
        super();
    }

    // Chat API methods
    async sendMessage(request: SendMessageRequest): Promise<APIResponse<SendMessageResponse>> {
        return this.request<SendMessageResponse>('POST', '/chat', request)
    }

    async getChatHistory(personaId: string): Promise<APIResponse<any>> {
        return this.request('GET', `/chat/history/${personaId}`)
    }

    async clearChatHistory(personaId: string): Promise<APIResponse<any>> {
        return this.request('DELETE', `/chat/history/${personaId}`)
    }
}

const chatApiClient = new ChatApiClient();

export const chatAPI = {
    sendMessage: chatApiClient.sendMessage.bind(chatApiClient),
    getChatHistory: chatApiClient.getChatHistory.bind(chatApiClient),
    clearChatHistory: chatApiClient.clearChatHistory.bind(chatApiClient),
}