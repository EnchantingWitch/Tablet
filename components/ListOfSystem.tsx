import { brand } from '@/constants/Colors';
import { useColorBlue, useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export type ListToDrop = {
    label: string;
    value: string; 
};

type Props = {
    list: ListToDrop[];
    post: string;
    buf: string;
    statusreq?: boolean;
    onChange: (subobj: string) => void;
    onChangeStatus?: (subobj: boolean) => void; 
};

const ListOfSystem = ({ list, post, buf, statusreq = true, onChange, onChangeStatus }: Props) => {
    const [value, setValue] = useState(post || '');
    const [isFocus, setIsFocus] = useState(false);
    const [searchText, setSearchText] = useState('');
    const dropdownRef = useRef<View>(null);
    const colorText = useColorText();
    const colorBlue = useColorBlue();
    const colorGray = useColorGray();
    const fontScale = useWindowDimensions().fontScale;
    const ts = (fontSize: number) => fontSize / fontScale;

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && list.length > 0) {
            setInitialized(true);
            return;
        }
        
        if (initialized) {
            setValue('');
            if (onChange) {
                onChange('');
            }
        }
    }, [list]);

    // ListOfSystem.tsx
useEffect(() => {
    // Устанавливаем значение только если post изменился
    if (post !== value) {
        setValue(post || '');
    }
}, [post]); // Зависим только от post, а не от list

useEffect(() => {
    // Обновляем родительский компонент только при ручном изменении значения
    if (value && onChange && value !== post) {
        onChange(value);
    }
}, [value]);

    useEffect(() => {
        if (value && onChange) {
            onChange(value);
        }
        if (onChangeStatus) {
            onChangeStatus(!!value);
        }
    }, [value]);

    const handleOpen = () => {
        if (!statusreq) return;
        setIsFocus(true);
    };

    const handleSelect = (selectedValue: string) => {
        setValue(selectedValue);
        setIsFocus(false);
    };

    const filteredData = searchText 
        ? list.filter(item => 
            item.label.toLowerCase().includes(searchText.toLowerCase()))
        : list;

    const selectedLabel = value 
        ? list.find(item => item.value === value)?.label 
        : 'Не выбрано';

    return (
        <View style={{width: '96%'}}>
            <View style={styles.container}>
                <View ref={dropdownRef}>
                    <TouchableOpacity
                        onPress={handleOpen}
                        style={[
                            styles.dropdown, {borderColor: colorGray},
                            isFocus && { borderColor: colorBlue },
                            !statusreq && { opacity: 0.5 }
                        ]}
                        disabled={!statusreq}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                            <View style={{width: '95%'}}>
                                <Text style={[styles.selectedTextStyle, { fontSize: ts(14), alignSelf: 'center', color: colorGray }]}>
                                    {post!=='' && post!==' ' && post!==undefined? post : 
                                                                <Text style={[styles.selectedTextStyle, { fontSize: ts(14), paddingBottom: 2,  alignSelf: 'center', color: colorGray  }]}>
                                                                    Не выбрано
                                                                </Text>}
                                </Text>
                            </View>
                            <View style={{width: '5%'}}>
                                <Ionicons name='chevron-down' color={colorGray}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <Modal
                    visible={isFocus}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setIsFocus(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setIsFocus(false)}
                    > 
                        <Animated.View 
                            style={[
                            styles.modalContent,
                            { maxHeight: '70%' } // Фиксированная процентная высота
                            ]}
                        >
                            <Text style={[styles.modalTitle, { fontSize: ts(14), color: colorBlue }]}>
                                Система
                            </Text>
                            <Text style={[styles.selectedValue, { fontSize: ts(16), color: colorGray }]}>
                                {value!=='' && value!==' ' && value!==undefined ? selectedLabel : 
                                                            <Text style={[styles.selectedTextStyle, { fontSize: ts(14), color: colorGray, paddingBottom: 2,  alignSelf: 'center' }]}>
                                                                Не выбрано
                                                            </Text>}
                            </Text>
                            <TextInput
                                placeholder="Поиск..."
                                placeholderTextColor={colorGray}
                                value={searchText}
                                onChangeText={setSearchText}
                                style={[styles.searchInput, { fontSize: ts(14), color: colorText }]}
                                autoFocus
                            />

                            <FlatList
                                data={filteredData}
                                keyExtractor={item => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.listItem}
                                        onPress={() => handleSelect(item.value)}
                                    >
                                        <Text style={{ fontSize: ts(14), color: colorText }}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                                keyboardShouldPersistTaps="handled"
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 16,
    },
    dropdown: {
        height: 42,
        borderColor: brand.bgBlue,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        backgroundColor: brand.white,
        justifyContent: 'center',
    },
    selectedTextStyle: {
        color: brand.bgBlue,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '50%',
        padding: 16,
    },
    modalTitle: {
        paddingBottom: 2,
        fontWeight: '500',
        color: brand.bluePrimary,
        alignSelf: 'center',
    },
    selectedValue: {
        paddingBottom: 14,
        alignSelf: 'center',
        color: brand.bgBlue,
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: brand.bgBlue,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
        backgroundColor: brand.white,
    },
    listItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: brand.bgBlueLight,
    },
});

export default ListOfSystem;