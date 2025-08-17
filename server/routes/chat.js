const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');

// Создаем экземпляр контроллера (без io для HTTP маршрутов)
const chatController = new ChatController(null);

// Получить сообщения комнаты
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await chatController.getRoomMessages(roomId, parseInt(limit), parseInt(offset));
    res.json(messages);
  } catch (error) {
    console.error('Error getting room messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить комнаты проекта
router.get('/projects/:projectId/rooms', async (req, res) => {
  try {
    const { projectId } = req.params;
    const rooms = await chatController.getProjectRooms(projectId);
    res.json(rooms);
  } catch (error) {
    console.error('Error getting project rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новую комнату
router.post('/rooms', async (req, res) => {
  try {
    const { projectId, name, roomType } = req.body;
    
    if (!projectId || !name) {
      return res.status(400).json({ error: 'Project ID and name are required' });
    }

    const room = await chatController.createChatRoom(projectId, name, roomType);
    res.json(room);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Добавить участника в комнату
router.post('/rooms/:roomId/participants', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, agentId } = req.body;
    
    if (!userId && !agentId) {
      return res.status(400).json({ error: 'Either userId or agentId is required' });
    }

    const participant = await chatController.addParticipantToRoom(roomId, userId, agentId);
    res.json(participant);
  } catch (error) {
    console.error('Error adding participant to room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Инициализация комнат для проекта
router.post('/projects/:projectId/initialize-rooms', async (req, res) => {
  try {
    const { projectId } = req.params;
    const rooms = await chatController.initializeProjectRooms(projectId);
    res.json(rooms);
  } catch (error) {
    console.error('Error initializing project rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
