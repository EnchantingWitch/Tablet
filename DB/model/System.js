import { Model } from '@nozbe/watermelondb'
import { field, relation, text } from '@nozbe/watermelondb/decorators'

export default class System extends Model {
  static table = 'systems'

  static associations = {
    objects: { type: 'belongs_to', key: 'object_id' },
    subobjects: { type: 'belongs_to', key: 'subobject_id' }
  }

  @text('id_pnrsystem_from_db') id_pnrsystem_from_db
  @text('ii_number') ii_number
  @text('system_name') system_name
  @text('ciwexecutor') ciwexecutor
  @field('subobject_id') subobject_id  // Используем @field для числовых полей
  @text('subobject_name') subobject_name
  @text('code_ccs') code_ccs

  @relation('objects', 'object_id') object
  @relation('subobjects', 'subobject_id') subobject
}