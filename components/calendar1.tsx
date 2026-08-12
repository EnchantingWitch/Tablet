import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns'

interface DatePickerProps {
    value: string;
    onChange: (dateString: string) => void; // Функция для обновления даты
    placeholder?: string;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({ value, onChange, placeholder }) => {
    const [showPicker, setShowPicker] = useState(false);

    // Преобразование строки в объект Date
    const dateValue = value ? new Date(value) : new Date();

    const minDate = new Date(2025, 0, 1)

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return `${day}.${month}.${year}`
    }

    // Обработчик изменения даты
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            //const dateString = selectedDate.toISOString().split('T')[0];
            const dateString = format(selectedDate, 'dd.MM.yyyy') // Формат: YYYY-MM-DD
            onChange(dateString); // Обновляем значение даты
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.input}
                onPress={() => setShowPicker(true)}
            >
                <Text style={value ? styles.text : styles.placeholder}>
                    {value || placeholder || 'Выберите дату'}
                </Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={minDate}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center'
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
    },
    placeholder: {
        fontSize: 16,
        color: '#888',
    },
});

export default DatePickerComponent;