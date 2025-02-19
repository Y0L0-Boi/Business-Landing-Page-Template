
import { Router } from 'express';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const router = Router();

async function loadKnowledgeBase() {
  const knowledgeDir = path.join(__dirname, '../knowledge');
  const files = await readdir(knowledgeDir);
  let knowledge = '';
  
  for (const file of files) {
    if (file.endsWith('.txt')) {
      const content = await readFile(path.join(knowledgeDir, file), 'utf-8');
      knowledge += content + '\n';
    }
  }
  
  return knowledge;
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const knowledge = await loadKnowledgeBase();
    
    // Here you can implement your chat logic using the loaded knowledge
    // For now, returning a simple response
    const response = "I'm your financial advisor bot. I can help you understand mutual funds, portfolio allocation, and investment procedures.";
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
