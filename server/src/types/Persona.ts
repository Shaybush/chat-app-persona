export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  avatarUrl?: string | null;
  isCustom?: boolean;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
