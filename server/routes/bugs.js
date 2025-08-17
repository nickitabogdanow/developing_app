const express = require('express');
const router = express.Router();
const pool = require('../models/database');

// Создать баг
router.post('/', async (req, res) => {
  try {
    const { projectId, title, description, severity, reportedBy } = req.body;

    if (!projectId || !title || !reportedBy) {
      return res.status(400).json({ error: 'Project ID, title and reporter are required' });
    }

    const result = await pool.query(
      'INSERT INTO bugs (project_id, title, description, severity, reported_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [projectId, title, description, severity, reportedBy]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить баги проекта
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(`
      SELECT b.*, u.name as reporter_name, aa.name as assigned_to_name
      FROM bugs b
      LEFT JOIN users u ON b.reported_by = u.id
      LEFT JOIN ai_agents aa ON b.assigned_to = aa.id
      WHERE b.project_id = $1
      ORDER BY b.created_at DESC
    `, [projectId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting project bugs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить баг по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT b.*, u.name as reporter_name, aa.name as assigned_to_name
      FROM bugs b
      LEFT JOIN users u ON b.reported_by = u.id
      LEFT JOIN ai_agents aa ON b.assigned_to = aa.id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting bug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить баг
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, severity, status, assignedTo } = req.body;

    const result = await pool.query(
      'UPDATE bugs SET title = COALESCE($1, title), description = COALESCE($2, description), severity = COALESCE($3, severity), status = COALESCE($4, status), assigned_to = COALESCE($5, assigned_to), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, description, severity, status, assignedTo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить баг
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM bugs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json({ message: 'Bug deleted successfully' });
  } catch (error) {
    console.error('Error deleting bug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить статистику багов по статусам
router.get('/project/:projectId/stats', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM bugs 
      WHERE project_id = $1 
      GROUP BY status
    `, [projectId]);

    const stats = {};
    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
    });

    res.json(stats);
  } catch (error) {
    console.error('Error getting bug stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
