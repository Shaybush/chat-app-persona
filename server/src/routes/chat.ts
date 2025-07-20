import { Router } from 'express';
import { getPersonaReply } from '../services/llmService';
import { Persona } from '../types/Persona';

const router = Router();

router.post('/', async (req, res) => {
  const { message, persona } = req.body as { message: string; persona: Persona };

  if (!message || !persona) {
    return res.status(400).json({ error: 'Message and persona are required' });
  }

  try {
    const reply = await getPersonaReply(message, persona.systemPrompt);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get a reply from the LLM' });
  }
});

export default router;
