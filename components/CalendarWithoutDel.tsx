import { useColorGray } from '@/hooks/useColorText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

type Props = {
    theme?: 'min';
    statusreq: boolean;//для обновления значения даты при получении даты с запроса
    post?: string; //дата, которую получаем из бд - передача для вывода в текстинпут
    onChange: (dateString: string) => void; // Функция для обновления даты
};

const CalendarWithoutDel = ({ theme, post, statusreq, onChange }: Props) => {//statusreq={statusRequest}
    const router = useRouter();
    //const {post} = useLocalSearchParams();
    const [date, setDate] = useState<Date|string|null>(new Date());
    const [check, setCheck] = useState<boolean>(false);//проверка на вывод пустого значения, если пришло null c бэка
    const [startD, setStartD] = useState<boolean>(true);//при первом рендеринге поставить значения из бд                                                                                
    const [valuePicker, setValuePicker]= useState<Date>(new Date());//регулирует дату в DateTimePicker, чтобы не вызывалось с null

    const [showPicker, setShowPicker] = useState(false);

    if (statusreq && startD){//startD
        //console.log('post', post);
        statusreq=false;setStartD(false);
        const customFormat = 'dd.MM.yyyy';//dd.MM.yyyy
        if (post === ' '){setValuePicker(new Date(2025,1,1));setDate(' '); {/*} console.log('setDate(" ")', date, ';', setDate(' '), ';')*/}}//выводит undefined //проверка, что с бд пришло не пустое значение, 
        else{                           //добавить состояние для ограничения вызова датапикер или вызова по значению сегодняшнего числа
            const dateFnsDate = parse(post, customFormat, new Date());//установка значения из бд
            console.log('dateFnsDate', dateFnsDate);
            setDate(dateFnsDate);
            setCheck(true);//установка true для вывода даты с бэка в текстинпут
            
            
            //router.setParams({  dateFnsDate });
        }
    }
    
    const fontScale = useWindowDimensions().fontScale;

    const ts = (fontSize: number) => {
        return (fontSize / fontScale)
    };

    const handleDateChange = (event, selectedDate) => {
        
        const currentDate = selectedDate ;
        setShowPicker(false);
        setDate(currentDate);
        setCheck(true);//установка true для вывода selectedDate в текстинпут
       // const d = formatDate(currentDate);
      //  console.log(d);//возращает строку в правильном формате
       // if (d != '') {router.setParams( {d} )};//возврат значения в функцию, не передает если переменную через formatDate пропускать
        if (selectedDate) {
                const dateString = format(selectedDate, 'dd.MM.yyyy') // Формат: YYYY-MM-DD
                onChange(dateString); // Обновляем значение даты          
        }
    };

    const showDatePicker = () => {
        if (date === ' ' || date === null) {setValuePicker(new Date());}
        else {setValuePicker(date);}
        setShowPicker(true);
    };

    const formatDate = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
        const yyyy = date.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    };

    if (theme === 'min') {
        return (
            <View style={styles.containerrowMin}>

               {/*} <RNDateTimePicker value={startdata()} />*/}

                <TextInput style={[styles.inputMin, { fontSize: ts(14), textAlignVertical: 'center',color: useColorGray(), borderColor: useColorGray() }]}
                    placeholderTextColor="#111"
                     
                    value={ check? (formatDate(date)): ' ' }
                   // value={ check? (formatDate(date)): null }
                   // value={ typeof(date)? (formatDate(date)): '' }
                  //value={date? (formatDate(date)) : '' }
                />
                 

                <TouchableOpacity style={{ width: '24%', height: '100%', alignSelf: 'flex-end', borderRadius: 4 }} onPress={showDatePicker}>
                    <Image style={{ width: 40, height: 40 }}
                        source={require('../assets/images/calendar1.png')} />
                    {showPicker && (
                        <DateTimePicker style={{}}
                            value={valuePicker}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                           // negativeButton={{label: 'Cancel', textColor: 'red'}}//only Android
                          //  neutralButton={{label: 'Clear', textColor: 'grey'}}//only Android
                        />
                    )}
                </TouchableOpacity>

            </View>
        );
    }
    return (
        <View style={styles.containerrow}>
            <TextInput style={[styles.input, { fontSize: ts(14) }]}
                placeholderTextColor="#111"
                value={formatDate(date)}
            />


            <TouchableOpacity style={{ width: '24%', height: '100%', alignSelf: 'flex-end', borderRadius: 4 }} onPress={showDatePicker}>
                <Image style={{ width: 70, height: 40 }}
                    source={require('../assets/images/calendar1.png')} />
                {showPicker && (
                    <DateTimePicker
                        value={valuePicker}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}
            </TouchableOpacity>

        </View >
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
        width: '96%',
        flexDirection: 'row',
        marginBottom: 8,
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
        width: '50%',
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

export default CalendarWithoutDel;