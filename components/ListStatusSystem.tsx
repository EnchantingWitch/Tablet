import { useColorBlue, useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

type Props = {
    post?: string;
    statusreq: boolean;
    pnrPlan?: string;
    pnrFact?: string;
    iiPlan?: string;
    iiFact?: string;
    koPlan?: string;
    koFact?: string;
    onChange: (status: string) => void;
};

const data1 = [
    { label: 'Ведутся СМР', value: 'Ведутся СМР' },
    { label: 'Завершены СМР', value: 'Завершены СМР' },
    { label: 'Предъявлено в ПНР', value: 'Предъявлено в ПНР' },
];

const data2 = [
    { label: 'Принято в ПНР', value: 'Принято в ПНР' },
    { label: 'Ведутся ПНР', value: 'Ведутся ПНР' },
    { label: 'Проведены ИИ', value: 'Проведены ИИ' },
    { label: 'Акт ИИ на подписи', value: 'Акт ИИ на подписи' },
];

const data3 = [
    { label: 'Акт ИИ подписан', value: 'Акт ИИ подписан' },
    { label: 'Проводится КО', value: 'Проводится КО' },
    { label: 'Проведено КО', value: 'Проведено КО' },
    { label: 'Акт КО на подписи', value: 'Акт КО на подписи' },
];

const data4 = [
    { label: 'Акт КО подписан', value: 'Акт КО подписан' },
];

const DropdownComponent = forwardRef(({
    post,
    statusreq,
    pnrPlan,
    pnrFact,
    iiPlan,
    iiFact,
    koPlan,
    koFact,
    onChange
}: Props, ref) => {
    const colorText = useColorText();
    const [value, setValue] = useState<string>(post || '');
    const [isFocus, setIsFocus] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
    const [swith, setSwith] = useState<number>(1);
    const dropdownRef = useRef<View>(null);
    const colorGray = useColorGray();
    const colorBlue = useColorBlue();
    const fontScale = useWindowDimensions().fontScale;
    const ts = (fontSize: number) => fontSize / fontScale;

    // Основной эффект для инициализации значений
    useEffect(() => {
        if (statusreq && post) {
            setValue(post);
            
            // Определяем какой набор данных использовать
            if (pnrFact && pnrFact == " " && iiFact && iiFact == " " && koFact && koFact == " ") {
                setSwith(1);
            }
            if (pnrFact && pnrFact != " ") {
                setSwith(2);
            }
            if (iiFact && iiFact != " ") {
                setSwith(3);
            }
            if (koFact && koFact != " ") {
                setSwith(4);
            }
        }
    }, [post, statusreq, pnrFact, iiFact, koFact]);

    // Эффект для обработки изменений дат
    useEffect(() => {
        if (pnrFact && pnrFact !== " ") {
            setSwith(2);
            if (!['Принято в ПНР', 'Ведутся ПНР', 'Проведены ИИ', 'Акт ИИ на подписи'].includes(value)) {
                setValue('Принято в ПНР');
            }
        } 
        if (iiFact && iiFact !== " ") {
            setSwith(3);
            if (!['Проводится КО', 'Проведено КО', 'Акт КО на подписи'].includes(value)) {
                setValue('Акт ИИ подписан');
            }
        } 
        if (koFact && koFact !== " ") {
            setSwith(4);
            setValue('Акт КО подписан');
        }
        if (pnrFact === " " && iiFact === " " && koFact === " ") {
            setSwith(1);
            if (!['Ведутся СМР', 'Завершены СМР', 'Предъявлено в ПНР'].includes(value)) {
                setValue(' ');
            }
        }
    }, [pnrFact, iiFact, koFact]);

    // Передаем изменения наружу
    useEffect(() => {
        if (value) {
            onChange(value);
        }
    }, [value]);

    const getData = () => {
        switch(swith) {
            case 2: return data2;
            case 3: return data3;
            case 4: return data4;
            default: return data1;
        }
    };

    const handleOpen = () => {
        if (!statusreq) return;
        
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
    };

    const filteredData = searchText 
        ? getData().filter(item => 
            item.label.toLowerCase().includes(searchText.toLowerCase()))
        : getData();

    const selectedLabel = value 
        ? getData().find(item => item.value === value)?.label 
        : 'Не выбрано';

    return (
        <View style={{width: '96%'}}>
            <View style={styles.container}>
                {/* Триггер для открытия модального окна */}
                <View ref={dropdownRef}>
                    <TouchableOpacity
                        onPress={handleOpen}
                        style={[styles.dropdown, {borderColor: colorGray}, isFocus && { borderColor: colorBlue }, ]}//!statusreq && { opacity: 0.5 }
                        disabled={!statusreq}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                            <View style={{width: '95%'}}>
                                <Text style={[styles.selectedTextStyle, { fontSize: ts(14), alignSelf: 'center', color: colorGray }]}>
                                    {value && (value!='' && value!=' ') ? selectedLabel : 'Не выбрано'}
                                </Text>
                            </View>
                            <View style={{width: '5%'}}>
                                <Ionicons name='chevron-down' color={ colorGray}/>
                            </View>
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
                                { maxHeight: '70%' }
                            ]}
                        >
                            <Text style={[styles.selectedTextStyle, { fontSize: ts(14), paddingBottom: 2, fontWeight: '500', color: colorBlue, alignSelf: 'center' }]}>
                                Статус объекта
                            </Text>
                            <Text style={[styles.selectedTextStyle, { fontSize: ts(16), paddingBottom: 14, alignSelf: 'center', color: colorGray }]}>
                                {value && value !== ' ' ? selectedLabel : 'Не выбрано'}
                            </Text>
                            <TextInput
                                placeholder="Поиск..."
                                placeholderTextColor={colorGray}
                                value={searchText}
                                onChangeText={setSearchText}
                                style={[styles.inputSearchStyle, { fontSize: ts(14), color: colorText }]}
                                autoFocus
                            />

                            <FlatList
                                data={filteredData}
                                keyExtractor={item => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            handleSelect(item.value);
                                            onChange(item.value);
                                        }}
                                    >
                                        <Text style={{ fontSize: ts(14), color: colorText  }}>{item.label}</Text>
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
    dropdownItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalContentBottom: {
        position: 'absolute',
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

export default DropdownComponent;