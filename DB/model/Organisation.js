import { Model } from '@nozbe/watermelondb'
import { text } from '@nozbe/watermelondb/decorators'

export default class Organisation extends Model {
  static table = 'organisations'

  @text('organisation') organisation
}