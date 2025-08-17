const OpenAI = require('openai');
const pool = require('../models/database');

class AIController {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Предопределенные ИИ агенты
    this.defaultAgents = [
      {
        name: "Алексей",
        role: "Project Manager",
        specialization: "Управление проектами, планирование, координация команды",
        personality: "Организованный, коммуникабельный, всегда следит за дедлайнами и качеством работы команды.",
        expertise_level: "senior"
      },
      {
        name: "Мария",
        role: "Senior Developer",
        specialization: "Full-stack разработка, архитектура приложений",
        personality: "Опытный разработчик с глубокими знаниями в различных технологиях. Любит чистый код и лучшие практики.",
        expertise_level: "senior"
      },
      {
        name: "Дмитрий",
        role: "Frontend Developer",
        specialization: "React, Vue.js, современные UI/UX подходы",
        personality: "Креативный разработчик, который создает красивые и функциональные интерфейсы.",
        expertise_level: "intermediate"
      },
      {
        name: "Анна",
        role: "Backend Developer",
        specialization: "Node.js, Python, базы данных, API разработка",
        personality: "Логичный и системный подход к решению задач. Специалист по серверной части приложений.",
        expertise_level: "intermediate"
      },
      {
        name: "Сергей",
        role: "QA Engineer",
        specialization: "Тестирование, автоматизация тестов, обеспечение качества",
        personality: "Внимательный к деталям, всегда находит баги и предлагает улучшения.",
        expertise_level: "intermediate"
      },
      {
        name: "Елена",
        role: "DevOps Engineer",
        specialization: "CI/CD, Docker, Kubernetes, инфраструктура",
        personality: "Технический специалист, который обеспечивает стабильную работу приложений в продакшене.",
        expertise_level: "senior"
      }
    ];
  }

  // Инициализация ИИ агентов в базе данных
  async initializeAgents() {
    try {
      for (const agent of this.defaultAgents) {
        const result = await pool.query(
          'INSERT INTO ai_agents (name, role, specialization, personality, expertise_level) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING *',
          [agent.name, agent.role, agent.specialization, agent.personality, agent.expertise_level]
        );
        if (result.rows.length > 0) {
          console.log(`Agent ${agent.name} initialized`);
        }
      }
    } catch (error) {
      console.error('Error initializing agents:', error);
    }
  }

  // Получить всех активных ИИ агентов
  async getAllAgents() {
    try {
      const result = await pool.query(
        'SELECT * FROM ai_agents WHERE is_active = true ORDER BY expertise_level DESC, name'
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting agents:', error);
      throw error;
    }
  }

  // Получить ИИ агента по ID
  async getAgentById(agentId) {
    try {
      const result = await pool.query(
        'SELECT * FROM ai_agents WHERE id = $1 AND is_active = true',
        [agentId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting agent by ID:', error);
      throw error;
    }
  }

  // Создать команду ИИ для проекта
  async createProjectTeam(projectId, agentIds) {
    try {
      const teamMembers = [];
      
      for (const agentId of agentIds) {
        const result = await pool.query(
          'INSERT INTO project_teams (project_id, agent_id) VALUES ($1, $2) RETURNING *',
          [projectId, agentId]
        );
        teamMembers.push(result.rows[0]);
      }
      
      return teamMembers;
    } catch (error) {
      console.error('Error creating project team:', error);
      throw error;
    }
  }

  // Получить команду проекта
  async getProjectTeam(projectId) {
    try {
      const result = await pool.query(`
        SELECT pt.*, aa.name, aa.role, aa.specialization, aa.personality, aa.expertise_level
        FROM project_teams pt
        JOIN ai_agents aa ON pt.agent_id = aa.id
        WHERE pt.project_id = $1 AND aa.is_active = true
        ORDER BY aa.expertise_level DESC, aa.name
      `, [projectId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting project team:', error);
      throw error;
    }
  }

  // Генерация ответа ИИ агента
  async generateAIResponse(agentId, context, message, projectContext = null) {
    try {
      const agent = await this.getAgentById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Формируем промпт для ИИ
      const systemPrompt = this.buildSystemPrompt(agent, context, projectContext);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  // Построение системного промпта для ИИ агента
  buildSystemPrompt(agent, context, projectContext) {
    let prompt = `Ты ${agent.name}, ${agent.role}. ${agent.personality}

Твоя специализация: ${agent.specialization}
Уровень экспертизы: ${agent.expertise_level}

Ты работаешь в команде разработчиков и общаешься с коллегами и заказчиком.`;

    if (projectContext) {
      prompt += `\n\nКонтекст проекта: ${projectContext}`;
    }

    if (context) {
      prompt += `\n\nКонтекст разговора: ${context}`;
    }

    prompt += `\n\nОтвечай от своего имени, используя свой характер и экспертизу. Будь полезным и конструктивным в общении.`;

    return prompt;
  }

  // Планирование спринта ИИ командой
  async planSprint(projectId, sprintData) {
    try {
      const team = await this.getProjectTeam(projectId);
      const project = await this.getProjectById(projectId);
      
      // Генерируем план спринта с помощью ИИ
      const sprintPlan = await this.generateSprintPlan(team, project, sprintData);
      
      return sprintPlan;
    } catch (error) {
      console.error('Error planning sprint:', error);
      throw error;
    }
  }

  // Генерация плана спринта
  async generateSprintPlan(team, project, sprintData) {
    try {
      const teamContext = team.map(member => 
        `${member.name} (${member.role}): ${member.specialization}`
      ).join('\n');

      const prompt = `Команда проекта "${project.name}":
${teamContext}

Задача: Создать план спринта "${sprintData.name}" длительностью ${sprintData.duration} дней.

Описание спринта: ${sprintData.description}

Создай детальный план с задачами, распределением по команде и временными оценками.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Ты опытный Project Manager, который создает детальные планы спринтов для команд разработки."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating sprint plan:', error);
      throw error;
    }
  }

  // Получить проект по ID
  async getProjectById(projectId) {
    try {
      const result = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [projectId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }
}

module.exports = AIController;
