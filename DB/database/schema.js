// database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 3,  // Версия схемы
  tables: [
    tableSchema({
      name: 'defacts',
      columns: [
        { name: 'ii_number', type: 'string' },
        { name: 'id_from_server', type: 'string' },
        { name: 'object_id', type: 'string' },
        { name: 'subobject', type: 'string' },
        { name: 'system_name', type: 'string' },//, isOptional: true
        { name: 'equipment', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'defective_act_status', type: 'string' },
        { name: 'executor', type: 'string' },
        { name: 'user_name', type: 'string' },
        { name: 'start_date', type: 'string' },
        { name: 'code_ccs', type: 'string' },
        { name: 'end_date_plan', type: 'string' },
        { name: 'end_date_fact', type: 'string' },
        { name: 'defective_act_explanation', type: 'string' },
        { name: 'manufacturer', type: 'string' },
        { name: 'manufacturer_number', type: 'string' },
        { name: 'flag_from_server', type: 'boolean' }//0 - лок база, 1 - сервер
      ]
    }),
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'object_id', type: 'string' },
        { name: 'ii_number', type: 'string' },
        { name: 'id_from_server', type: 'string' },
        { name: 'subobject', type: 'string' },//, isOptional: true
        { name: 'system_name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'comment_status', type: 'string' },
        { name: 'executor', type: 'string' },
        { name: 'user_name', type: 'string' },
        { name: 'start_date', type: 'string' },
        { name: 'comment_category', type: 'string' },
        { name: 'comment_explanation', type: 'string' },
        { name: 'code_ccs', type: 'string' },
        { name: 'end_date_plan', type: 'string' },
        { name: 'end_date_fact', type: 'string' },
        { name: 'flag_from_server', type: 'boolean' }//0 - лок база, 1 - сервер
      ]
    }),
    tableSchema({
      name: 'objects',
      columns: [
        { name: 'code_ccs', type: 'string' },
        { name: 'code_name_ccs', type: 'string'}//, isOptional: true 
      ]
    }),
    tableSchema({
      name: 'organisations',
      columns: [
        { name: 'organisation', type: 'string'}//, isOptional: true 
      ]
    }),
    tableSchema({
      name: 'subobjects',
      columns: [
        { name: 'object_id', type: 'string' },
        { name: 'code_ccs', type: 'string' },
        { name: 'subobject_name', type: 'string' },
      ]
    }),
    tableSchema({
      name: 'systems',
      columns: [
        { name: 'object_id', type: 'string' },
        { name: 'id_pnrsystem_from_db', type: 'string' },
        { name: 'ii_number', type: 'string' },
        { name: 'system_name', type: 'string' },
        { name: 'ciwexecutor', type: 'string' }, //исполнитель
        { name: 'subobject_id', type: 'number' }, //внешний ключ
        { name: 'subobject_name', type: 'string' }, 
        { name: 'code_ccs', type: 'string' }
      ]
    })
  ]
})