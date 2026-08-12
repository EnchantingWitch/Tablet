// services/UserService.js
import { Q } from '@nozbe/watermelondb'
import { database } from '../database'

class UserService {
  // Создание пользователя
  createUser = async (userData) => {
    return await database.write(async () => {
      return await database.get('users').create(user => {
        user.name = userData.name
        user.email = userData.email
        user.age = userData.age
        user.createdAt = Date.now()
        user.updatedAt = Date.now()
      })
    })
  }

  // Получение всех пользователей
  getAllUsers = async () => {
    return await database.get('users').query().fetch()
  }

  // Поиск по email
  findUserByEmail = async (email) => {
    return await database.get('users')
      .query(Q.where('email', email))
      .fetch()
  }

  // Обновление пользователя
  updateUser = async (user, updates) => {
    return await database.write(async () => {
      return await user.update(userRecord => {
        userRecord.name = updates.name || userRecord.name
        userRecord.email = updates.email || userRecord.email
        userRecord.updatedAt = Date.now()
      })
    })
  }
}

export default new UserService()