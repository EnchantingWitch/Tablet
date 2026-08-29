import { brand } from '@/constants/Colors';
import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

type Props = {
    post?: string;
    onChange: (status: string) => void; // Функция для обновления статуса
};

export const data = [
    { label: 'Компрессорная станция', value: '1' },
    { label: 'Дожимная компрессорная станция', value: '2' },
    { label: 'Установка комлексной подготовки газа', value: '3' },
    { label: 'Подземное хранилище газа', value: '4' },
    { label: 'Газовой промысел. Кусты газовых скважин', value: '5' },
    { label: 'Газовой промысел. Газосборные коллекторы', value: '6' },
    { label: 'Магистральный газопровод', value: '7' },
    { label: 'Газопровод-отвод', value: '8' },
    { label: 'Газоизмерительная станция', value: '9' },
    { label: 'Газораспределительная станция', value: '10' },
    { label: 'Комплекс по ПХиО СПГ', value: '11' },
    { label: 'Нефтеперекачивающая станция', value: '12' },
    { label: 'Центральный пункт сбора', value: '13' },
    { label: 'Нефтеконденсатопровод', value: '14' },
    { label: 'Газоконденсатное месторождение', value: '15' },
    { label: 'Газоперерабатывающий завод', value: '16' },
    { label: 'Нефтегазоконденсатное месторождение', value: '17' },
    { label: 'Газопровод перемычка', value: '18' },
    { label: 'Нефтепровод', value: '19' },
    { label: 'Терминал отгрузки конденсата', value: '20' },
];

const ListTypeObj = ({ post, onChange }: Props) => {
    const [value, setValue] = useState<string >();
    const [isFocus, setIsFocus] = useState(false);

     const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

    if (value){
        onChange(value);
    }
 
    return (
       
        <View style={styles.container}>
            <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue',   }]}
                placeholderStyle={[styles.placeholderStyle, { fontSize: ts(14)}]}
                selectedTextStyle={[styles.selectedTextStyle, { fontSize: ts(14)} ]}
                inputSearchStyle={[styles.inputSearchStyle, { fontSize: ts(14)}]}
                iconStyle={styles.iconStyle}
                data={data}
                search
                maxHeight={300}
                itemTextStyle={{fontSize: ts(14)}}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Тип ОКС' : 'Не выбрано'}
                searchPlaceholder="Search..."
                value={post? post: value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                }}
            />
        </View>
            
    );
};

export default ListTypeObj;

export const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingBottom: 16,
        width: '96%',
    },
    dropdown: {
        height: 42,
        borderColor: brand.bgBlue,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        

    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
      //  fontSize: 14,
        
    },
    placeholderStyle: {
       // fontSize: 16,
       textAlign: 'center',
       color: brand.bgBlue,
    },
    selectedTextStyle: {
        //fontSize: 16,
        textAlign: 'center',
        color: brand.bgBlue,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
       // fontSize: 16,
    },
});