import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export type ListToDrop = {
    label: string;
    value: string; 
};

type Props = {
    list: ListToDrop[]; // список
    post: string; // значение из бд статуса для просмотра, при записи передавать пустую строку
    statusreq: boolean; // для обновления значения даты при получении даты с запроса
    onChange: (subobj: string) => void; // Функция для обновления значения
};

const ListOfSubobj = ({ list, post, statusreq, onChange }: Props) => {
    const [value, setValue] = useState<string>('');
    const [isFocus, setIsFocus] = useState(false);
    const fontScale = useWindowDimensions().fontScale;

    const ts = (fontSize: number) => {
        return (fontSize / fontScale);
    };

    useEffect(() => {
        // Устанавливаем значение из props при изменении post
        if (post !== value) {
          setValue(post || '');
        }
      }, [post]);
      
      useEffect(() => {
        // Обновляем родительский компонент при изменении значения
        if (value && onChange) {
          onChange(value);
        }
      }, [value]);
      
    return (
        <View style={styles.container}>
            <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={[styles.placeholderStyle, { fontSize: ts(14), includeFontPadding: false, }]}
                selectedTextStyle={[styles.selectedTextStyle, { fontSize: ts(14) , lineHeight: ts(20),includeFontPadding: false, textAlignVertical: 'center'}]}
                inputSearchStyle={[styles.inputSearchStyle, { fontSize: ts(14) }]}
                iconStyle={styles.iconStyle}
                data={list}
                search
                maxHeight={300}
                itemTextStyle={{ fontSize: ts(14) }}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Не выбрано' : 'Не выбрано'}
                searchPlaceholder="Search..."
                value={value}
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

// ... остальной код стилей остается без изменений

export default ListOfSubobj;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingBottom: 16,
        width: '96%',
    },
    dropdown: {
        height: 42,
        borderColor: '#D9D9D9',
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
       color: '#B3B3B3',
    },
    selectedTextStyle: {
        //fontSize: 16,
        textAlign: 'center',
        color: '#B3B3B3',
         lineHeight: 18.5,
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