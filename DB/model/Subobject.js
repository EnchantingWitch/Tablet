import { Model } from '@nozbe/watermelondb'
import { relation, text } from '@nozbe/watermelondb/decorators'

export default class Subobject extends Model {
  static table = 'subobjects'

  static associations = {
    objects: { type: 'belongs_to', key: 'object_id' }
  }

  @text('code_ccs') code_ccs
  @text('system_name') system_name

  @relation('objects', 'object_id') object
}