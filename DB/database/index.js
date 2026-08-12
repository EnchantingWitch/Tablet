// DB/database.ts
import { Database } from '@nozbe/watermelondb'; // Убедитесь, что этот импорт есть
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import migrations from '../model/migrations';

// Импорт моделей
import ConstructionObject from '../model/ConstructionObject';
import Defact from '../model/Defact';
import Note from '../model/Note';
import Organisation from '../model/Organisation';
import Subobject from '../model/Subobject';
import System from '../model/System';

// Импорт схемы
import schema from './schema';

// Создание адаптера
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'myapp_db',
  // Для React Native:
  // jsi: true, // Включить JSI для лучшей производительности (только iOS/Android)
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  }
});

// Экспорт базы данных
export const database = new Database({
  adapter,
  modelClasses: [
    ConstructionObject,
    Note,
    Defact,
    Subobject,
    System,
    Organisation
  ],
});