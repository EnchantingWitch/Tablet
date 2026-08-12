import { useColorGray } from '@/hooks/useColorText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { default as React, useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

type Props = {
    theme?: 'min';
    onChange: (dateString: string) => void;
  }; 

const CalendarOnWrite = ({theme, onChange }: Props) => {
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const fontScale = useWindowDimensions().fontScale;
const colorGray = useColorGray();
  const ts = (fontSize: number) => {
    return (fontSize / fontScale)
  };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowPicker(false);
        setDate(currentDate);
        if (selectedDate) {
                        const dateString = format(selectedDate, 'dd.MM.yyyy') // Формат: YYYY-MM-DD
                        onChange(dateString); // Обновляем значение даты          
                }
    };
    if (date){
        const dateString = format(date, 'dd.MM.yyyy'); 
        onChange(dateString);
    }

    const showDatePicker = () => {
        setShowPicker(true);
    };

    const formatDate = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
        const yyyy = date.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    };
    if (theme === 'min'){ return(
        <View style={styles.containerrowMin}>
            <TextInput style={[styles.inputMin, {fontSize: ts(14), borderColor: colorGray, color: colorGray}]}
                        //placeholder="Исполнитель"
                placeholderTextColor="#111"
                value={formatDate(date)}
            />
      
            
            <TouchableOpacity style={{width: '24%', height: '100%', alignSelf: 'flex-end', borderRadius: 4 }} onPress={showDatePicker}>
             <Image style={{ width: 40, height: 40 }}
                                    source={require('../assets/images/calendar1.png')} /> 
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            </TouchableOpacity>
      
        </View>
    );
    }
    return (
        <View style={styles.containerrow}>
            <TextInput style={[styles.input, {fontSize: ts(14), borderColor: colorGray, color: colorGray}]}
                        //placeholder="Исполнитель"
                placeholderTextColor="#111"
                value={formatDate(date)}
            />
      
            
            <TouchableOpacity style={{alignSelf: 'flex-end', borderRadius: 4,  }} onPress={showDatePicker}>
             <Image style={{ width: 40, height: 40 }}
                                    source={require('../assets/images/calendar1.png')} /> 
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            </TouchableOpacity>
      
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        //paddingTop: 11,
        //paddingBottom: 12,
        backgroundColor: '#fff',
        width: '20%',

    },
    containerrow: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 11,
        paddingBottom: 12,
        backgroundColor: '#fff',
        //width: '100%',
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    containerrowMin: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 11,
        paddingBottom: 12,
        backgroundColor: '#fff',
        width: '0%',
        flexDirection: 'row',
        marginBottom: 8,
    },
    resultText: {
        fontSize: 14,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        width: '70%',
        height: 42,
        color: '#B3B3B3',
        textAlign: 'center',
    },
    inputMin: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        width: '66%',
        height: 42,
        color: '#B3B3B3',
        textAlign: 'center',
    },
});

export default CalendarOnWrite;