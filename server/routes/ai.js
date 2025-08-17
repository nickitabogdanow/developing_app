const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');

const aiController = new AIController();

// Получить всех ИИ агентов
router.get('/agents', async (req, res) => {
  try {
    const agents = await aiController.getAllAgents();
    res.json(agents);
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить ИИ агента по ID
router.get('/agents/:id', async (req, res) => {
  try {
    const agent = await aiController.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error getting agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать команду для проекта
router.post('/teams', async (req, res) => {
  try {
    const { projectId, agentIds } = req.body;
    
    if (!projectId || !agentIds || !Array.isArray(agentIds)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const team = await aiController.createProjectTeam(projectId, agentIds);
    res.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить команду проекта
router.get('/teams/:projectId', async (req, res) => {
  try {
    const team = await aiController.getProjectTeam(req.params.projectId);
    res.json(team);
  } catch (error) {
    console.error('Error getting project team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Планирование спринта
router.post('/sprint-plan', async (req, res) => {
  try {
    const { projectId, sprintData } = req.body;
    
    if (!projectId || !sprintData) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const sprintPlan = await aiController.planSprint(projectId, sprintData);
    res.json({ plan: sprintPlan });
  } catch (error) {
    console.error('Error planning sprint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Инициализация агентов (для разработки)
router.post('/initialize', async (req, res) => {
  try {
    await aiController.initializeAgents();
    res.json({ message: 'Agents initialized successfully' });
  } catch (error) {
    console.error('Error initializing agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
