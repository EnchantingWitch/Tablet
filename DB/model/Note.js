import { Model } from '@nozbe/watermelondb'
import { field, relation, text } from '@nozbe/watermelondb/decorators'

export default class Note extends Model {
  static table = 'notes'

  static associations = {
    objects: { type: 'belongs_to', key: 'object_id' }
  }

  @text('ii_number') ii_number
  @text('id_from_server') id_from_server
  @text('subobject') subobject
  @text('system_name') system_name
  @text('description') description
  @text('defective_act_status') defective_act_status
  @text('comment_status') comment_status
  @text('executor') executor
  @text('start_date') start_date
  @text('comment_category') comment_category
  @text('comment_explanation') comment_explanation
  @text('code_ccs') code_ccs
  @text('end_date_plan') end_date_plan
  @text('end_date_fact') end_date_fact

  @field('flag_from_server') flag_from_server
  
  @relation('objects', 'object_id') object
}