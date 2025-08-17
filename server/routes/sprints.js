const express = require('express');
const router = express.Router();
const pool = require('../models/database');

// Создать спринт
router.post('/', async (req, res) => {
  try {
    const { projectId, name, description, startDate, endDate } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ error: 'Project ID and name are required' });
    }

    const result = await pool.query(
      'INSERT INTO sprints (project_id, name, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [projectId, name, description, startDate, endDate]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить спринты проекта
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM sprints WHERE project_id = $1 ORDER BY start_date DESC',
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting project sprints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить спринт по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM sprints WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting sprint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить спринт
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status } = req.body;

    const result = await pool.query(
      'UPDATE sprints SET name = COALESCE($1, name), description = COALESCE($2, description), start_date = COALESCE($3, start_date), end_date = COALESCE($4, end_date), status = COALESCE($5, status) WHERE id = $6 RETURNING *',
      [name, description, startDate, endDate, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating sprint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить спринт
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM sprints WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    res.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
