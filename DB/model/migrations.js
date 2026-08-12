import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
     {
      toVersion: 3,
       steps: [
        // Добавляем поле id_from_server в таблицу notes
        {
          type: 'add_columns',
          table: 'notes',
          columns: [
            { name: 'flag_from_server', type: 'boolean' }
          ]
        },
        // Добавляем поле id_from_server в таблицу defacts
        {
          type: 'add_columns',
          table: 'defacts',
          columns: [
            { name: 'flag_from_server', type: 'boolean' }
          ]
        }
      ]
    },
    {
      toVersion: 2,
       steps: [
        // Добавляем поле id_from_server в таблицу notes
        {
          type: 'add_columns',
          table: 'notes',
          columns: [
            { name: 'id_from_server', type: 'string', isOptional: true }
          ]
        },
        // Добавляем поле id_from_server в таблицу defacts
        {
          type: 'add_columns',
          table: 'defacts',
          columns: [
            { name: 'id_from_server', type: 'string', isOptional: true }
          ]
        }
      ]
    },
  ],
})