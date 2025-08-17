const fs = require('fs');
const path = require('path');
const pool = require('./models/database');
const AIController = require('./controllers/aiController');

async function initializeDatabase() {
  try {
    console.log('🚀 Инициализация базы данных...');
    
    // Читаем SQL схему
    const schemaPath = path.join(__dirname, 'models', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Выполняем SQL скрипт
    await pool.query(schema);
    console.log('✅ Таблицы созданы успешно');
    
    // Инициализируем ИИ агентов
    console.log('🤖 Инициализация ИИ агентов...');
    const aiController = new AIController();
    await aiController.initializeAgents();
    console.log('✅ ИИ агенты инициализированы');
    
    console.log('🎉 База данных готова к использованию!');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
  } finally {
    await pool.end();
  }
}

// Запускаем инициализацию
initializeDatabase();
