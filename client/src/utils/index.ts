// Форматирование даты
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

// Форматирование времени
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Форматирование даты и времени
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('ru-RU');
};

// Форматирование валюты
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Получение цвета статуса
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'planning':
    case 'planned':
      return 'bg-yellow-100 text-yellow-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
    case 'done':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
    case 'closed':
      return 'bg-red-100 text-red-800';
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-orange-100 text-orange-800';
    case 'review':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Получение текста статуса
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'planning':
      return 'Планирование';
    case 'active':
      return 'Активный';
    case 'completed':
      return 'Завершен';
    case 'cancelled':
      return 'Отменен';
    case 'planned':
      return 'Запланирован';
    case 'done':
      return 'Выполнено';
    case 'todo':
      return 'К выполнению';
    case 'in_progress':
      return 'В работе';
    case 'review':
      return 'На проверке';
    case 'open':
      return 'Открыт';
    case 'assigned':
      return 'Назначен';
    case 'testing':
      return 'Тестирование';
    case 'resolved':
      return 'Решен';
    case 'closed':
      return 'Закрыт';
    default:
      return status;
  }
};

// Получение цвета приоритета
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Получение текста приоритета
export const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'Низкий';
    case 'medium':
      return 'Средний';
    case 'high':
      return 'Высокий';
    case 'critical':
      return 'Критический';
    default:
      return priority;
  }
};

// Получение цвета серьезности бага
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Получение текста серьезности бага
export const getSeverityText = (severity: string): string => {
  switch (severity) {
    case 'low':
      return 'Низкая';
    case 'medium':
      return 'Средняя';
    case 'high':
      return 'Высокая';
    case 'critical':
      return 'Критическая';
    default:
      return severity;
  }
};

// Получение цвета уровня экспертизы
export const getExpertiseColor = (level: string): string => {
  switch (level) {
    case 'senior':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'junior':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Получение текста уровня экспертизы
export const getExpertiseText = (level: string): string => {
  switch (level) {
    case 'senior':
      return 'Senior';
    case 'intermediate':
      return 'Intermediate';
    case 'junior':
      return 'Junior';
    default:
      return level;
  }
};

// Обрезка текста
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Генерация инициалов
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Проверка валидности email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Проверка валидности пароля
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Сохранение в localStorage
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Получение из localStorage
export const getFromLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

// Удаление из localStorage
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Задержка
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Генерация случайного ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Форматирование размера файла
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Проверка типа файла
export const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'document';
    case 'xls':
    case 'xlsx':
      return 'spreadsheet';
    case 'txt':
      return 'text';
    case 'zip':
    case 'rar':
    case '7z':
      return 'archive';
    default:
      return 'file';
  }
};
