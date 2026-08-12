import { Model } from '@nozbe/watermelondb'
import { children, text } from '@nozbe/watermelondb/decorators'

export default class ConstructionObject extends Model {
  static table = 'objects'

  static associations = {
    defacts: { type: 'has_many', foreignKey: 'object_id' },
    notes: { type: 'has_many', foreignKey: 'object_id' },
    subobjects: { type: 'has_many', foreignKey: 'object_id' },
    systems: { type: 'has_many', foreignKey: 'object_id' }
  }

  @text('code_ccs') code_ccs
  @text('code_name_ccs') code_name_ccs

  @children('defacts') defacts
  @children('notes') notes
  @children('subobjects') subobjects
  @children('systems') systems
  
}