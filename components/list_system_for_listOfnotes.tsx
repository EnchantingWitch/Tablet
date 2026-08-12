import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';


const data = [
    { label: 'ТО', value: 'ТО' },
    { label: 'ЭО', value: 'ЭО' },
    { label: 'АСУ', value: 'АСУ' },
    { label: 'ПБ', value: 'ПБ' },
    { label: 'ОВиК', value: 'ОВиК' },
    { label: 'ТЭО', value: 'ТЭО' },
    { label: 'ВК', value: 'ВК' },
    { label: 'ЭХЗ', value: 'ЭХЗ' },
    { label: 'МО', value: 'МО' },
    { label: 'КИТСО', value: 'КИТСО' },
    { label: 'ПТО', value: 'ПТО' }, 
    { label: 'МОО', value: 'МОО' },
    { label: 'ХиКУ', value: 'ХиКУ' },
    { label: 'ГТМ', value: 'ГТМ' },
    { label: 'ПЭМ', value: 'ПЭМ' },
    { label: 'ИБ', value: 'ИБ' },
    { label: 'КЗ', value: 'КЗ' },
];


const DropdownComponent = () => {
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

     const fontScale = useWindowDimensions().fontScale;

    const ts = (fontSize: number) => {
        return (fontSize / fontScale)};

    return (
        <View >
            <Dropdown
               
                style={[styles.dropdown]}
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
                placeholder={!isFocus ? 'Система' : 'Система'}
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

export default DropdownComponent;

const styles = StyleSheet.create({

    dropdown: {
        width: 95,
        marginLeft: -5,
       // fontSize: 14,
    },
    icon: {
        marginRight: 5,
    },

    placeholderStyle: {
        fontFamily: 'Inter',
       // fontSize: 14,
        fontWeight: '400',
        color: '#334155',
        textAlign: 'center',
    },
    selectedTextStyle: {
        fontFamily: 'Inter',
        //fontSize: 14,
        fontWeight: '400',
        color: '#334155',
        textAlign: 'center',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        fontFamily: 'Inter',
        //fontSize: 14,
        fontWeight: '400',
        color: '#334155',
        textAlign: 'center',
    },
});