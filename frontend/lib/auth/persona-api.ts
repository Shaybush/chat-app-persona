import { APIResponse, CreatePersonaRequest, Persona } from "@/types";
import { ApiClient } from "./api";

class PersonaApiClient extends ApiClient {
    constructor() {
        super();
    }

    async getPersonas(): Promise<APIResponse<Persona[]>> {
        return this.request<Persona[]>('GET', '/personas')
    }

    async createPersona(request: CreatePersonaRequest): Promise<APIResponse<Persona>> {
        return this.request<Persona>('POST', '/personas', request)
    }

    async updatePersona(id: string, updates: Partial<Persona>): Promise<APIResponse<Persona>> {
        return this.request<Persona>('PUT', `/personas/${id}`, updates)
    }

    async deletePersona(id: string): Promise<APIResponse<any>> {
        return this.request('DELETE', `/personas/${id}`)
    }
}

const personaApiClient = new PersonaApiClient();

export const personaAPI = {
    getPersonas: personaApiClient.getPersonas.bind(personaApiClient),
    createPersona: personaApiClient.createPersona.bind(personaApiClient),
    updatePersona: personaApiClient.updatePersona.bind(personaApiClient),
    deletePersona: personaApiClient.deletePersona.bind(personaApiClient),
}