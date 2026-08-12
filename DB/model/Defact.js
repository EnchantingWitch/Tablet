import { Model } from '@nozbe/watermelondb'
import { field, relation, text } from '@nozbe/watermelondb/decorators'

export default class Defact extends Model {
  static table = 'defacts'

  static associations = {
    objects: { type: 'belongs_to', key: 'object_id' }
  }

  @text('ii_number') ii_number
  @text('id_from_server') id_from_server
  @text('subobject') subobject
  @text('system_name') system_name
  @text('equipment') equipment
  @text('description') description
  @text('defective_act_status') defective_act_status
  @text('executor') executor
  @text('user_name') user_name
  @text('start_date') start_date
  @text('code_ccs') code_ccs
  @text('end_date_plan') end_date_plan
  @text('end_date_fact') end_date_fact
  @text('defective_act_explanation') defective_act_explanation
  @text('manufacturer') manufacturer
  @text('manufacturer_number') manufacturer_number

  @field('flag_from_server') flag_from_server

  @relation('objects', 'object_id') object
}