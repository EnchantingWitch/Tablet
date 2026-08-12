import { useColorBlue, useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const data = [
    { label: 'Без доступа', value: 'NONE' },
    { label: 'Исполнитель ПНР', value: 'CWEXECUTOR' },
    { label: 'Руководитель ПНР', value: 'CWSUPERVISOR' },
    { label: 'Куратор ПНР', value: 'CWCURATOR' },
    { label: 'Исполнитель СМР', value: 'CIWEXECUTOR' },
    { label: 'Руководитель СМР', value: 'CIWSUPERVISOR' },
    { label: 'Эксплуатация', value: 'EXPLOITING' },
    { label: 'Администратор', value: 'ADMIN' },
];

type Props = {
    post: string;
    status: boolean;
    onChange: (status: string) => void;
};

const ListOfAccessRole = ({ post, status, onChange }: Props) => {
    const [value, setValue] = useState(post || '');
    const [isFocus, setIsFocus] = useState(false);
    const [searchText, setSearchText] = useState('');
    const dropdownRef = useRef<View>(null);
    const colorText = useColorText();
    const colorGray = useColorGray();
    const fontScale = useWindowDimensions().fontScale;
    const ts = (fontSize: number) => fontSize / fontScale;

    useEffect(() => {
        if (post !== value && status) {
            setValue(post);
        }
    }, [post, status]);

    useEffect(() => {
        if (value && onChange) {
            onChange(value);
        }
    }, [value]);

    const handleOpen = () => {
        if (!status) return;
        setIsFocus(true);
    };

    const handleSelect = (selectedValue: string) => {
        setValue(selectedValue);
        setIsFocus(false);
    };

    const filteredData = searchText 
        ? data.filter(item => 
            item.label.toLowerCase().includes(searchText.toLowerCase()))
        : data;

    const selectedLabel = value 
        ? data.find(item => item.value === value)?.label 
        : 'Выберите роль';

    return (
        <View style={{width: '96%'}}>
            <View style={styles.container}>
                <View ref={dropdownRef}>
                    <TouchableOpacity
                        onPress={handleOpen}
                        style={[
                            styles.dropdown, {borderColor: colorGray}, 
                            isFocus && { borderColor: useColorBlue() },
                            !status && { opacity: 0.5 }
                        ]}
                        disabled={!status}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                            <View style={{width: '95%'}}>
                                <Text style={[styles.selectedTextStyle, { fontSize: ts(14), alignSelf: 'center', color: colorGray }]}>
                                    {selectedLabel? selectedLabel : post==='USER'? 'Пользователь' : 'Выберите роль'}
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
                        <View style={styles.modalContent}>
                            <Text style={[styles.modalTitle, { fontSize: ts(14), color: useColorBlue() }]}>
                                Уровень доступа
                            </Text>
                            <Text style={[styles.selectedValue, { fontSize: ts(16), color: colorGray }]}>
                                {value ? selectedLabel : 'Не выбрано'}
                            </Text>
                            <TextInput
                                placeholder="Поиск..."
                                placeholderTextColor={colorGray}
                                value={searchText}
                                onChangeText={setSearchText}
                                style={[styles.searchInput, { fontSize: ts(14), color: colorText, borderColor: colorGray }]}
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
                        </View>
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
        borderColor: '#D9D9D9',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    selectedTextStyle: {
        color: '#B3B3B3',
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
        color: '#0072C8',
        alignSelf: 'center',
    },
    selectedValue: {
        color: '#B3B3B3',
        paddingBottom: 14,
        alignSelf: 'center',
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    listItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
});

export default ListOfAccessRole;