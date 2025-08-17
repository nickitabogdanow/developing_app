const pool = require('../models/database');
const AIController = require('./aiController');

class ChatController {
  constructor(io) {
    this.io = io;
    this.aiController = new AIController();
  }

  // Обработка входящих сообщений
  async handleMessage(socket, data) {
    try {
      const { roomId, senderType, senderId, content, messageType = 'text' } = data;

      // Сохраняем сообщение в базе данных
      const savedMessage = await this.saveMessage(roomId, senderType, senderId, content, messageType);

      // Отправляем сообщение всем участникам комнаты
      this.io.to(roomId).emit('new-message', savedMessage);

      // Если сообщение от пользователя, генерируем ответы от ИИ агентов
      if (senderType === 'user') {
        await this.generateAIResponses(roomId, content, savedMessage);
      }

    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  }

  // Сохранение сообщения в базе данных
  async saveMessage(roomId, senderType, senderId, content, messageType) {
    try {
      const result = await pool.query(
        'INSERT INTO messages (room_id, sender_type, sender_id, content, message_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [roomId, senderType, senderId, content, messageType]
      );

      // Получаем полную информацию о сообщении
      const message = result.rows[0];
      
      if (senderType === 'user') {
        const user = await this.getUserById(senderId);
        message.senderName = user ? user.name : 'Unknown User';
      } else if (senderType === 'ai') {
        const agent = await this.aiController.getAgentById(senderId);
        message.senderName = agent ? agent.name : 'Unknown AI';
      }

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // Генерация ответов от ИИ агентов
  async generateAIResponses(roomId, userMessage, originalMessage) {
    try {
      // Получаем участников комнаты
      const participants = await this.getRoomParticipants(roomId);
      const aiAgents = participants.filter(p => p.agent_id);

      // Получаем контекст разговора
      const conversationContext = await this.getConversationContext(roomId);

      // Генерируем ответы от каждого ИИ агента
      for (const participant of aiAgents) {
        try {
          const aiResponse = await this.aiController.generateAIResponse(
            participant.agent_id,
            conversationContext,
            userMessage,
            await this.getProjectContext(roomId)
          );

          // Сохраняем и отправляем ответ ИИ
          const savedResponse = await this.saveMessage(
            roomId,
            'ai',
            participant.agent_id,
            aiResponse,
            'text'
          );

          // Небольшая задержка для естественности
          setTimeout(() => {
            this.io.to(roomId).emit('new-message', savedResponse);
          }, Math.random() * 3000 + 1000); // 1-4 секунды

        } catch (error) {
          console.error(`Error generating response for agent ${participant.agent_id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error generating AI responses:', error);
    }
  }

  // Получение участников комнаты
  async getRoomParticipants(roomId) {
    try {
      const result = await pool.query(
        'SELECT * FROM room_participants WHERE room_id = $1',
        [roomId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting room participants:', error);
      throw error;
    }
  }

  // Получение контекста разговора
  async getConversationContext(roomId, limit = 10) {
    try {
      const result = await pool.query(
        'SELECT content, sender_type, sender_id FROM messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT $2',
        [roomId, limit]
      );

      return result.rows.reverse().map(msg => ({
        content: msg.content,
        senderType: msg.sender_type,
        senderId: msg.sender_id
      }));
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return [];
    }
  }

  // Получение контекста проекта
  async getProjectContext(roomId) {
    try {
      const result = await pool.query(`
        SELECT p.name, p.description, p.status
        FROM chat_rooms cr
        JOIN projects p ON cr.project_id = p.id
        WHERE cr.id = $1
      `, [roomId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting project context:', error);
      return null;
    }
  }

  // Получение пользователя по ID
  async getUserById(userId) {
    try {
      const result = await pool.query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Создание новой чат-комнаты
  async createChatRoom(projectId, name, roomType = 'general') {
    try {
      const result = await pool.query(
        'INSERT INTO chat_rooms (name, project_id, room_type) VALUES ($1, $2, $3) RETURNING *',
        [name, projectId, roomType]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  // Добавление участника в комнату
  async addParticipantToRoom(roomId, userId = null, agentId = null) {
    try {
      const result = await pool.query(
        'INSERT INTO room_participants (room_id, user_id, agent_id) VALUES ($1, $2, $3) RETURNING *',
        [roomId, userId, agentId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error adding participant to room:', error);
      throw error;
    }
  }

  // Получение сообщений комнаты
  async getRoomMessages(roomId, limit = 50, offset = 0) {
    try {
      const result = await pool.query(`
        SELECT m.*, 
               CASE 
                 WHEN m.sender_type = 'user' THEN u.name
                 WHEN m.sender_type = 'ai' THEN aa.name
               END as sender_name,
               CASE 
                 WHEN m.sender_type = 'user' THEN u.email
                 WHEN m.sender_type = 'ai' THEN aa.role
               END as sender_info
        FROM messages m
        LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id
        LEFT JOIN ai_agents aa ON m.sender_type = 'ai' AND m.sender_id = aa.id
        WHERE m.room_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
      `, [roomId, limit, offset]);

      return result.rows.reverse();
    } catch (error) {
      console.error('Error getting room messages:', error);
      throw error;
    }
  }

  // Получение всех комнат проекта
  async getProjectRooms(projectId) {
    try {
      const result = await pool.query(
        'SELECT * FROM chat_rooms WHERE project_id = $1 ORDER BY created_at',
        [projectId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting project rooms:', error);
      throw error;
    }
  }

  // Инициализация комнат для нового проекта
  async initializeProjectRooms(projectId) {
    try {
      const rooms = [
        { name: 'Общий чат', type: 'general' },
        { name: 'Менеджеры', type: 'managers' },
        { name: 'Разработчики', type: 'developers' },
        { name: 'Тестировщики', type: 'testers' },
        { name: 'DevOps', type: 'devops' }
      ];

      const createdRooms = [];
      
      for (const room of rooms) {
        const createdRoom = await this.createChatRoom(projectId, room.name, room.type);
        createdRooms.push(createdRoom);
      }

      return createdRooms;
    } catch (error) {
      console.error('Error initializing project rooms:', error);
      throw error;
    }
  }
}

module.exports = ChatController;
