import { APIResponse, HealthCheckResponse } from "@/types";
import { ApiClient } from "./api";

class SystemApiClient extends ApiClient {
    constructor() {
        super();
    }

    async healthCheck(): Promise<APIResponse<HealthCheckResponse>> {
        return this.request('GET', '/health')
    }
}

const systemApiClient = new SystemApiClient();

export const systemAPI = {
    healthCheck: systemApiClient.healthCheck.bind(systemApiClient),
}