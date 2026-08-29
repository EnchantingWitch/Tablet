import { brand } from '@/constants/Colors';
import { useColorBlue, useColorGray, useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export type ListToDrop = {
    label: string;
    value: string; 
};

type Props = {
    list: ListToDrop[]; // список
    nameFilter: string;
    width?: number;
   // statusreq: boolean; // для обновления значения даты при получении даты с запроса
    onChange: (subobj: string) => void; // Функция для обновления значения
};

const ListOfSubobj = ({ list, nameFilter, width, onChange }: Props) => {
    const colorText = useColorText();
    const colorSkyBlue = useColorSkyBlueCarpet(0.4);
    const colorBlue = useColorBlue();
    const colorGray = useColorGray();
    const [value, setValue] = useState<string>('');
    const [isFocus, setIsFocus] = useState(false);
    const [List, setList] = useState<ListToDrop[]>([]);
    const fontScale = useWindowDimensions().fontScale;

    const ts = (fontSize: number) => {
        return (fontSize / fontScale);
    };
      
      useEffect(() => {
        // Обновляем родительский компонент при изменении значения
        if (value && onChange) {
          onChange(value);
        }
      }, [value]);

      useEffect(() => {
        if(list){
           // console.log('listComponent',list);
            const updated = List.map(item => {
                const found = list.find(s => s.label === item.label);
                return found ? { ...item, value: found.value } : item;
              });
              setList(updated);
           }
      }, [list]);

     // console.log('List', List);
      
    return (
        <View style={[styles.container, {width: width? width : 110}]}>
            <Dropdown
                style={[styles.dropdown, {borderColor: colorSkyBlue}, isFocus && { borderColor: colorBlue, }]}
                placeholderStyle={[styles.placeholderStyle, { fontSize: ts(14), includeFontPadding: false, color: colorText}]}
                selectedTextStyle={[styles.selectedTextStyle, { fontSize: ts(14), includeFontPadding: false, color: colorText}]}
                inputSearchStyle={[styles.inputSearchStyle, { fontSize: ts(14), includeFontPadding: false, color: colorText, borderColor: colorGray }]}
                iconStyle={styles.iconStyle}
                containerStyle={{
                    //width: '37%', // Ширина списка может отличаться от инпута
                    borderColor: colorSkyBlue,
                    borderWidth: 1,
                    borderRadius: 8,
        //alignSelf: 'flex-start',
                  }}
                data={list}
                search
                maxHeight={300}
                itemTextStyle={{ fontSize: ts(12), color: colorText }}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? nameFilter : nameFilter}
                searchPlaceholder="Поиск..."
              //  searchPlaceholderTextColor={colorText}
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
const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        //paddingBottom: 16,
        width: 110,
        borderRadius: 8,
    },
    dropdown: {
        height: 37,
        borderColor: brand.bgBlueLight,
        borderWidth: 2,
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
       //color: brand.bgBlue,
      
    },
    selectedTextStyle: {
        //fontSize: 16,
        textAlign: 'center',
       // color: brand.bgBlue,
       
    },
    iconStyle: {
        width: 10,
        height: 10,
    },
    inputSearchStyle: {
        height: 37,
        borderRadius: 8,
        color: brand.bgBlue
       // fontSize: 16,
    },
});

export default ListOfSubobj;

