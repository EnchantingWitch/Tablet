import { database } from '@/DB/database';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

const DatabaseTestScreen = () => {
  const [status, setStatus] = useState('Проверяем...');
  const [details, setDetails] = useState<string[]>([]);

  const checkDatabase = async () => {
    try {
      setDetails(['Начинаем проверку базы данных...']);
      
      if (!database) {
        setStatus('❌ База данных не инициализирована');
        return;
      }

      // Проверяем коллекции
      const collections = database.collections;
      setDetails(prev => [...prev, `Коллекции: ${Object.keys(collections).join(', ')}`]);

      // Проверяем схему
      const adapter = database.adapter;
      setDetails(prev => [...prev, 'Адаптер подключен']);

      // Проверяем таблицу notes
      try {
        const notesCollection = database.collections.get('notes');
        const notesCount = await notesCollection.query().fetchCount();
        setDetails(prev => [...prev, `Заметок в базе: ${notesCount}`]);
        
        // Пробуем получить первую заметку
        const firstNote = await notesCollection.query().fetch();
        if (firstNote.length > 0) {
          setDetails(prev => [...prev, `Первая заметка: id=${firstNote[0].id}, object_id=${firstNote[0].object_id}`]);
        }
      } catch (error) {
        setDetails(prev => [...prev, `❌ Ошибка чтения notes: ${error.message}`]);
      }

      // Проверяем таблицу objects
      try {
        const objectsCollection = database.collections.get('objects');
        const objectsCount = await objectsCollection.query().fetchCount();
        setDetails(prev => [...prev, `Объектов в базе: ${objectsCount}`]);
        
        const objects = await objectsCollection.query().fetch();
        objects.forEach(obj => {
          setDetails(prev => [...prev, `Объект: ${obj.code_ccs} - ${obj.code_name_ccs}`]);
        });
      } catch (error) {
        setDetails(prev => [...prev, `❌ Ошибка чтения objects: ${error.message}`]);
      }

      setStatus('✅ Проверка завершена');
      
    } catch (error) {
      setStatus(`❌ Ошибка: ${error.message}`);
      setDetails(prev => [...prev, `Stack: ${error.stack}`]);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Проверка базы данных</Text>
      <Text style={styles.status}>{status}</Text>
      
      <ScrollView style={styles.detailsContainer}>
        {details.map((detail, index) => (
          <Text key={index} style={styles.detail}>{detail}</Text>
        ))}
      </ScrollView>
      
      <Button title="Проверить снова" onPress={checkDatabase} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  detailsContainer: {
    flex: 1,
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  detail: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

export default DatabaseTestScreen;