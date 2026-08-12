import { database } from '@/DB/database';
import { Q } from '@nozbe/watermelondb';

export const checkDatabaseContent = async () => {
  try {
    console.log('=== DATABASE DEBUG START ===');
    
    if (!database) {
      console.error('❌ Database is not initialized');
      return;
    }
    
    // Проверяем доступность всех коллекций
    const collections = database.collections;
    console.log('✅ Available collections:', Object.keys(collections));
    
    // Проверяем таблицу objects
    console.log('\n=== OBJECTS TABLE ===');
    try {
      const objectsCollection = database.collections.get('objects');
      const allObjects = await objectsCollection.query().fetch();
      console.log(`📊 Total objects: ${allObjects.length}`);
      
      allObjects.forEach((obj, index) => {
        console.log(`${index + 1}. code_ccs: "${obj.code_ccs}", name: "${obj.code_name_ccs}"`);
      });
    } catch (error) {
      console.error('❌ Error reading objects:', error);
    }
    
    // Проверяем таблицу notes
    console.log('\n=== NOTES TABLE ===');
    try {
      const notesCollection = database.collections.get('notes');
      const allNotes = await notesCollection.query().fetch();
      console.log(`📊 Total notes: ${allNotes.length}`);
      
      allNotes.forEach((note, index) => {
        console.log(`${index + 1}. object_id: "${note.object_id}", ii_number: "${note.ii_number}", system_name: "${note.system_name}"`);
      });
    } catch (error) {
      console.error('❌ Error reading notes:', error);
    }
    
    // Проверяем таблицу systems
    console.log('\n=== SYSTEMS TABLE ===');
    try {
      const systemsCollection = database.collections.get('systems');
      const allSystems = await systemsCollection.query().fetch();
      console.log(`📊 Total systems: ${allSystems.length}`);
      
      allSystems.forEach((system, index) => {
        console.log(`${index + 1}. object_id: "${system.object_id}", system_name: "${system.system_name}", subobject_name: "${system.subobject_name}"`);
      });
    } catch (error) {
      console.error('❌ Error reading systems:', error);
    }
    
    // Специфичный поиск для объекта 1000-0001-3
    console.log('\n=== SEARCH FOR OBJECT 1000-0001-3 ===');
    const targetObjectId = '1000-0001-3';
    
    try {
      const objectsCollection = database.collections.get('objects');
      const targetObjects = await objectsCollection
        .query(Q.where('code_ccs', targetObjectId))
        .fetch();
      
      console.log(`🔍 Found ${targetObjects.length} objects with code_ccs = "${targetObjectId}"`);
      
      if (targetObjects.length > 0) {
        const object = targetObjects[0];
        console.log(`Object details: code_ccs: "${object.code_ccs}", name: "${object.code_name_ccs}"`);
        
        // Ищем заметки для этого объекта
        const notesCollection = database.collections.get('notes');
        const objectNotes = await notesCollection
          .query(Q.where('object_id', targetObjectId))
          .fetch();
        
        console.log(`📝 Found ${objectNotes.length} notes for this object`);
        objectNotes.forEach((note, index) => {
          console.log(`  Note ${index + 1}: ii_number: "${note.ii_number}", system_name: "${note.system_name}", description: "${note.description?.substring(0, 50)}..."`);
        });
        
        // Ищем системы для этого объекта
        const systemsCollection = database.collections.get('systems');
        const objectSystems = await systemsCollection
          .query(Q.where('object_id', targetObjectId))
          .fetch();
        
        console.log(`⚙️ Found ${objectSystems.length} systems for this object`);
        objectSystems.forEach((system, index) => {
          console.log(`  System ${index + 1}: system_name: "${system.system_name}", subobject_name: "${system.subobject_name}"`);
        });
      }
    } catch (error) {
      console.error('❌ Error searching for object:', error);
    }
    
    console.log('=== DATABASE DEBUG END ===\n');
  } catch (error) {
    console.error('❌ Database debug error:', error);
  }
};