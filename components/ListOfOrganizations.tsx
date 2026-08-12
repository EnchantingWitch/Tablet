import { useColorBlue, useColorGray, useColorLightGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

type Props = {
    post: string;
    status: boolean;
    title: string;
    label?: string;
    data: Array<{label: string, value: string}>;
    onChange: (value: string) => void;
};

const AdaptiveDropdown = forwardRef(({ post, status, title, label, data, onChange }: Props, ref) => {
    const colorText = useColorText();
    const colorTextVersion = useColorBlue();
    const colorTextBorder = useColorGray();
    const colorTextBorderLight = useColorLightGray();
    const [value, setValue] = useState(post || '');
    const [isFocus, setIsFocus] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
    const dropdownRef = useRef<View>(null);

    const fontScale = useWindowDimensions().fontScale;
    const ts = (fontSize: number) => fontSize / fontScale;

    useEffect(() => {
        if (post !== value && status) {
            setValue(post);
        }
    }, [post, status]);

    const handleOpen = () => {
        Keyboard.dismiss(); // Скрываем клавиатуру перед открытием
        if (dropdownRef.current) {
            dropdownRef.current.measureInWindow((x, y, width, height) => {
                const windowHeight = Dimensions.get('window').height;
                const spaceBelow = windowHeight - y - height;
                setDropdownPosition(spaceBelow > 340 ? 'bottom' : 'top');
            });
        }
        setIsFocus(true);
    };

    const handleSelect = (selectedValue: string) => {
        setValue(selectedValue);
        setIsFocus(false);
        onChange(selectedValue);
    };

    const filteredData = searchText 
        ? data.filter(item => 
            item.label.toLowerCase().includes(searchText.toLowerCase()))
        : data;

    const selectedLabel = value 
        ? data.find(item => item.value === value)?.label 
        : title;

    return (
        <View style={{width: '96%'}}>
        <View style={styles.container}>
            {/* Триггер для открытия модального окна */}
            <View ref={dropdownRef} >
                <TouchableOpacity
                    onPress={handleOpen}
                    style={[styles.dropdown, {borderColor: colorTextBorder}, isFocus && { borderColor: colorTextVersion }]}
                >
                    <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                        <View style={{width: '95%'}}>
                        <Text style={[styles.selectedTextStyle, { fontSize: ts(14), alignSelf: 'center', color: colorTextBorder }]}>
                            {post? post: selectedLabel? selectedLabel : 'Не выбрано'}
                        </Text></View>
                        <View style={{width: '5%'}}>
                        <Ionicons name='chevron-down' color={ colorTextBorder}/></View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Модальное окно с выпадающим списком */}
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
                       <Text style={[styles.selectedTextStyle, { fontSize: ts(14), paddingBottom: 2, fontWeight: 500,  color: colorTextVersion, alignSelf: 'center' }]}>
                        {label}
                    </Text>
                    <Text style={[styles.selectedTextStyle, { fontSize: ts(16), paddingBottom: 14, alignSelf: 'center', color: colorTextBorder }]}>
                        {post!=='' && post!==' ' && post!==undefined? post : 
                            <Text style={[styles.selectedTextStyle, { fontSize: ts(14), paddingBottom: 2,  alignSelf: 'center', color: colorTextBorder }]}>
                                Не выбрано
                            </Text>}
                    </Text>
                        <TextInput
                            placeholder="Поиск..."
                            
                            placeholderTextColor={colorTextBorder}
                            value={searchText}
                            onChangeText={setSearchText}
                            style={[styles.inputSearchStyle, { fontSize: ts(14), color: colorText, borderColor: colorTextBorder }]}
                            autoFocus
                        />

                        <FlatList
                            data={filteredData}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.dropdownItem, {borderBottomColor: colorTextBorderLight}]}
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
});

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
        textAlign: 'left',
    },
  dropdownInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  dropdownText: {
    fontSize: 16,
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
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dropdownItem: {
    paddingVertical: 12,
   // alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
   modalContentBottom: {
        position: 'absolute',
       // bottom: 150,
        left: 0,
        right: 0,
    },
    inputSearchStyle: {
        height: 40,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
});

export default AdaptiveDropdown;