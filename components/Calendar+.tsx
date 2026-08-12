import { useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

type Props = { 
    theme?: 'min';
    statusreq: boolean;//для обновления значения даты при получении даты с запроса
    post?: string; //дата, которую получаем из бд - передача для вывода в текстинпут
    onChange?: (dateString: string) => void; // Функция для обновления даты
    diseditable?: boolean;
};

const DateInputWithPicker = ({ theme, post, statusreq, onChange, diseditable }: Props) => {//statusreq={statusRequest}
    const router = useRouter();
    //const {post} = useLocalSearchParams();
    const [date, setDate] = useState<Date|string|null>(new Date());
    const [check, setCheck] = useState<boolean>(false);//проверка на вывод пустого значения, если пришло null c бэка
    const [startD, setStartD] = useState<boolean>(true);//при первом рендеринге поставить значения из бд                                                                                
    const [valuePicker, setValuePicker]= useState<Date>(new Date());//регулирует дату в DateTimePicker, чтобы не вызывалось с null
    const [chooseD, setChooseD] = useState<boolean>();//крестик - true (дата выбрана), kалендарь - false (дата не выбрана)
    const str = ' ';
    const [showPicker, setShowPicker] = useState(false);
    const [swith, setSwith] = useState(false);//используется для рендеринга при смене chooseD, ограничение на рендеринг только при нажатии на крестик или после выбора даты
    const colorGray = useColorGray();

   // console.log(check, 'check', date);
   // console.log(chooseD, 'chooseD', date);

    useEffect(() => {
 
        //смена статуса при изменении даты
          if (chooseD) {
            if(chooseD == true){
                //setValuePicker(new Date(2025,1,1));
                setCheck(true);
            } 
            if (chooseD === false) {
                
                setDate(' ');  
                setCheck(false);
                console.log(check, 'check after setCheck(false);', date);
                onChange(' ');
              //прописать вызов запроса и положить в setCommentStat значение из json, чтобы статус сменился на актуальный вместо не устранено
            }
            
            }
            if(post){
                const customFormat = 'dd.MM.yyyy';//dd.MM.yyyy
                if (post === ' '){
                    //setCheck(false);
                    setValuePicker(new Date(2025,1,1));
                    //setDate(' '); 
                    setCheck(false);
                    setChooseD(false); {/*} console.log('setDate(" ")', date, ';', setDate(' '), ';')*/}}//выводит undefined //проверка, что с бд пришло не пустое значение, 
                else{                           //добавить состояние для ограничения вызова датапикер или вызова по значению сегодняшнего числа
                    const dateFnsDate = parse(post, customFormat, new Date());//установка значения из бд
                  //  console.log('dateFnsDate', dateFnsDate);
                    setDate(dateFnsDate);
                    setCheck(true);//установка true для вывода даты с бэка в текстинпут

                    setChooseD(true);
                }
        }
        }, [chooseD, post]);

        if(chooseD && swith){
            //setValuePicker(new Date(2025,1,1));
            setSwith(false);

            setCheck(true);
        } 
        if (chooseD === false && swith) {
            setSwith(false);

            setDate(' ');  
            setCheck(false);
            console.log(check, 'check after setCheck(false);', date);
            onChange(' ');//передаем на запись пустое значение после нажатия на крестик
        }

    if (statusreq && startD){//startD
        //console.log('post', post);
        statusreq=false;setStartD(false);
        const customFormat = 'dd.MM.yyyy';//dd.MM.yyyy
        if (post === ' '){
            //setCheck(false);
            setValuePicker(new Date(2025,1,1));
            setDate(' '); 
            setChooseD(false); {/*} console.log('setDate(" ")', date, ';', setDate(' '), ';')*/}}//выводит undefined //проверка, что с бд пришло не пустое значение, 
        else{                           //добавить состояние для ограничения вызова датапикер или вызова по значению сегодняшнего числа
            const dateFnsDate = parse(post, customFormat, new Date());//установка значения из бд
          //  console.log('dateFnsDate', dateFnsDate);
            setDate(dateFnsDate);
            setCheck(true);//установка true для вывода даты с бэка в текстинпут

            setChooseD(true);
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
              //  console.log(dateString);   
                setChooseD(true);//установка крестика вместо календаря    
                setSwith(true);//для смены текстинпута
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

                <TextInput style={[styles.inputMin, { fontSize: ts(14), textAlignVertical: 'center', color: colorGray, borderColor: colorGray }]}
                    placeholderTextColor="#111"
                    editable={false}
                    value={ check? (formatDate(date)): (str) }
                    //value={ date}
                   // value={ check? (formatDate(date)): null }
                   // value={ typeof(date)? (formatDate(date)): '' }
                  //value={date? (formatDate(date)) : '' }
                />
                 
                 {chooseD? 
                 (
                    <TouchableOpacity onPress={() => [setChooseD(false), setSwith(true)]} style = {{ width: 40}} disabled={diseditable}>
                        <Ionicons name='close-outline' size={30} style={{alignSelf: 'center',}} color={useColorText()}/>
                    </TouchableOpacity>)
                 :(
                    <TouchableOpacity style={{  borderRadius: 4 }} onPress={showDatePicker} disabled={diseditable}>
                    
                        
                        <Image style={{ width: 40, height: 40, }}
                            source={require('../assets/images/calendar1.png')} />

                        {showPicker && (
                            <DateTimePicker style={{}}
                                value={check? (valuePicker): (new Date())}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            //  negativeButton={{label: 'Cancel', textColor: 'red'}}//only Android
                                //neutralButton={{label: 'Clear', textColor: 'grey'}}//only Android
                            />
                        )}


                    </TouchableOpacity>
                )}

            </View>
        );
    }
    return (
        <View style={styles.containerrow}>
            <TextInput style={[styles.input, { fontSize: ts(14) }]}
                placeholderTextColor="#111"
                editable={false}
                value={check? (formatDate(date)): ' '}
            />


            <TouchableOpacity disabled={diseditable} style={{ justifyContent: 'center', borderRadius: 4 }} onPress={showDatePicker}>
                <Image style={{ width: 40, height: 40,  }}
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
        //paddingTop: 11,
        //paddingBottom: 12,
        backgroundColor: '#fff',
        width: '100%',
        flexDirection: 'row',
        marginBottom: 13,
        alignItems: 'center',
    },
    containerrowMin: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 11,
        paddingBottom: 12,
        backgroundColor: '#fff',
      //  width: '0%',
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

export default DateInputWithPicker;