const express = require('express');
const router = express.Router();
const pool = require('../models/database');
const ChatController = require('../controllers/chatController');

const chatController = new ChatController(null);

// Создать новый проект
router.post('/', async (req, res) => {
  try {
    const { name, description, budget, deadline, clientId } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({ error: 'Name and client ID are required' });
    }

    const result = await pool.query(
      'INSERT INTO projects (name, description, client_id, budget, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, clientId, budget, deadline]
    );

    const project = result.rows[0];

    // Инициализируем чат-комнаты для проекта
    await chatController.initializeProjectRooms(project.id);

    res.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить все проекты пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting user projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить проект по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить проект
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, budget, deadline } = req.body;

    const result = await pool.query(
      'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status), budget = COALESCE($4, budget), deadline = COALESCE($5, deadline), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, description, status, budget, deadline, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить проект
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить статистику проекта
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Получаем количество задач
    const tasksResult = await pool.query(
      'SELECT COUNT(*) as total_tasks FROM tasks t JOIN sprints s ON t.sprint_id = s.id WHERE s.project_id = $1',
      [id]
    );

    // Получаем количество багов
    const bugsResult = await pool.query(
      'SELECT COUNT(*) as total_bugs FROM bugs WHERE project_id = $1',
      [id]
    );

    // Получаем количество спринтов
    const sprintsResult = await pool.query(
      'SELECT COUNT(*) as total_sprints FROM sprints WHERE project_id = $1',
      [id]
    );

    // Получаем команду проекта
    const teamResult = await pool.query(
      'SELECT COUNT(*) as team_size FROM project_teams WHERE project_id = $1',
      [id]
    );

    const stats = {
      totalTasks: parseInt(tasksResult.rows[0].total_tasks),
      totalBugs: parseInt(bugsResult.rows[0].total_bugs),
      totalSprints: parseInt(sprintsResult.rows[0].total_sprints),
      teamSize: parseInt(teamResult.rows[0].team_size)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting project stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
