import { brand } from '@/constants/Colors';
import ListOfOrganizations from '@/components/ListOfOrganizations';
import { useColorGray, useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomButton from './CustomButton';

// Константы для стилей
//const colorGray = brand.gray;

const SubcontractorsSMR = ({
  visible,
  onClose,
  values,
  setValues,
  dropdownData,
  dataLoaded = true,
}) => {
  const [localValues, setLocalValues] = useState([]);
  const colorText = useColorText();
  const colorGray = useColorGray();
  const colorSky = useColorSkyBlueCarpet(0.4);

  // Инициализация локальных состояний при открытии модального окна
  useEffect(() => {
    if (visible) {
      setLocalValues([...values]);
    }
  }, [visible, values]);

  // Добавление нового выпадающего списка
  const addNewDropdown = () => {
    setLocalValues(prev => [...prev, '']);
  };

  // Удаление выпадающего списка
  const removeDropdown = (index) => {
    setLocalValues(prev => prev.filter((_, i) => i !== index));
  };

  // Обновление значения в локальном состоянии
  const updateLocalValue = (index, newValue) => {
    setLocalValues(prev => {
      const newValues = [...prev];
      newValues[index] = newValue;
      return newValues;
    });
  };

  // Обработка нажатия OK
  const handleOk = () => {
    // Фильтруем пустые значения и удаляем дубликаты
    const filteredValues = [];
    const uniqueValues = new Set(); // Для отслеживания уникальных значений

    localValues.forEach((value) => {
      // Пропускаем пустые значения и дубликаты
      if (value !== '' && value.trim() !== '' && !uniqueValues.has(value)) {
        uniqueValues.add(value);
        filteredValues.push(value);
      }
    });

    // Передаем отфильтрованные данные в основную форму
    setValues(filteredValues);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
            <View style={{flexDirection: 'row', width: 280}}>
              <View style={{width: 225}}>
                <Text style={[styles.title, {color: colorText}]}>Субподрядчики</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{ alignSelf: 'flex-start', }}
              >
                <Ionicons name="close-outline" size={30} color={colorText}/>
              </TouchableOpacity>
            </View>

          <ScrollView style={styles.scrollContainer}>
            {localValues.map((value, index) => (
              <View key={index} style={styles.dropdownRow}>
                <View style={styles.dropdownContainer}>
                   <ListOfOrganizations
                    data={dropdownData}
                    post={value}
                    title={value}
                    status={dataLoaded}
                    onChange={(newValue) => updateLocalValue(index, newValue)}
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeDropdown(index)}
                >
                  <Ionicons name='remove-outline' size={30} color={colorText}  />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Кнопка добавления нового списка */}
            <View style={{width: '100%', flexDirection: 'row', paddingBottom: 30}}>
                <View style={{alignItems: 'flex-end', width: '85%'}}>
                    <View style={{width: '60%',backgroundColor: colorSky, borderRadius: 8, height: 40}}/>
                </View>
                <TouchableOpacity
                style={styles.addButton}    
                onPress={addNewDropdown}
                >
                <Ionicons name="add-outline" size={30} color={colorText} />
                </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Кнопка OK */}
          <CustomButton title={'OK'} handlePress={handleOk}/>
          
        </View>
      </View>
    </Modal>
  );
};

// Стили компонента
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: brand.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dropdownContainer: {
    flex: 1,
   
    //marginRight: 10,
  },
  removeButton: {
   // padding: 5,
   height: 52,
   //backgroundColor: 'green',
   alignSelf: 'flex-end',
  },
  addButton: {
    alignSelf: 'center',
    alignItems: 'flex-end',
    width: '15%',
    //backgroundColor: 'green'
    //paddingEn: 10,
   // marginTop: 10,
  },

});

export default SubcontractorsSMR;