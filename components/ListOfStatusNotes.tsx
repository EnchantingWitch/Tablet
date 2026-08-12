import { useColorBlue, useColorGray, useColorText } from '@/hooks/useColorText';
import useDevice from '@/hooks/useDevice';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

type Props = {
    post: string;
    originalPost: string;
    status: boolean;
    title: string;
    label?: string;
    userRole: string;
    onChange: (value: string) => void;
};

// Статичный список всех возможных статусов
const ALL_STATUSES = [
    { label: 'Выдано', value: 'Выдано' },
    { label: 'Отклонено', value: 'Отклонено' },
    { label: 'Принято', value: 'Принято' },
    { label: 'Предъявлено на устранение', value: 'Предъявлено на устранение' },
    { label: 'Не устранено', value: 'Не устранено' },
    { label: 'Устранено', value: 'Устранено' },
    { label: 'Просрочено', value: 'Просрочено' },
];

// Роли пользователей
const ROLES = {
    EXECUTOR_PNR: 'CWEXECUTOR',//'Исполнитель ПНР',
    LEADER_PNR: 'CWSUPERVISOR',//'Руководитель ПНР',
    CURATOR_PNR: 'CWCURATOR',//'Куратор ПНР',
    EXECUTOR_SMR: 'CIWEXECUTOR',//'Исполнитель СМР',
    LEADER_SMR: 'CIWSUPERVISOR',//'Руководитель СМР',
};

const ListOfStatusNotes = forwardRef(({ post, originalPost, status, title, label, userRole, onChange }: Props, ref) => {
    const { isDesktopWeb } = useDevice();
    const colorText = useColorText();
    const colorTextVersion = useColorBlue();
    const colorTextBorder = useColorGray();
    const [value, setValue] = useState(post || '');
    const [isFocus, setIsFocus] = useState(false);
    const [searchText, setSearchText] = useState('');
    const dropdownRef = useRef<View>(null);
    const modalContentRef = useRef<View>(null);

    const fontScale = useWindowDimensions().fontScale;
    const ts = (fontSize: number) => fontSize / fontScale;

    useEffect(() => {
        if (post !== value && status) {
            setValue(post);
        }
    }, [post, status]);

    // Функция для получения доступных статусов в зависимости от роли и текущего статуса
    const getAvailableStatuses = (): Array<{label: string, value: string}> => {
        const currentStatus = originalPost;
        
        // Статусы, которые недоступны для выбора пользователем
        const systemStatuses = ['Выдано', 'Просрочено'];
        
        // Базовый фильтр - убираем системные статусы
        let availableStatuses = ALL_STATUSES.filter(status => 
            !systemStatuses.includes(status.value)
        );

        // Логика доступности статусов в зависимости от текущего статуса и роли
        switch (currentStatus) {
            case 'Выдано':
                if (userRole === ROLES.EXECUTOR_SMR || userRole === ROLES.LEADER_SMR) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Выдано', 'Отклонено', 'Принято', 'Предъявлено на устранение'].includes(item.value)
                    );
                } else if (userRole === ROLES.LEADER_PNR) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Выдано', 'Принято', 'Предъявлено на устранение'].includes(item.value)
                    );
                } else {
                    availableStatuses = [];
                }
                break;

            case 'Отклонено':
                if (userRole === ROLES.CURATOR_PNR || userRole === ROLES.LEADER_SMR || userRole === ROLES.LEADER_PNR ) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Отклонено', 'Принято'].includes(item.value)
                    );
                } else {
                    availableStatuses = [];
                }
                break;

            case 'Принято':
                if (userRole === ROLES.LEADER_PNR) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Принято', 'Отклонено', 'Предъявлено на устранение'].includes(item.value)
                    );
                } else if ([ROLES.CURATOR_PNR, ROLES.EXECUTOR_SMR, ROLES.LEADER_SMR].includes(userRole)) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Принято', 'Предъявлено на устранение'].includes(item.value)
                       // item.value === 'Предъявлено на устранение'
                    );
                } else {
                    availableStatuses = [];
                }
                break;

            case 'Предъявлено на устранение':
                if (userRole === ROLES.EXECUTOR_PNR || userRole === ROLES.LEADER_PNR) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Предъявлено на устранение', 'Не устранено', 'Устранено'].includes(item.value)
                    );
                } else if ([ROLES.CURATOR_PNR, ROLES.EXECUTOR_SMR, ROLES.LEADER_SMR].includes(userRole)) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Предъявлено на устранение', 'Принято'].includes(item.value)
                        // item.value === 'Принято'
                    );
                } else {
                    availableStatuses = [];
                }
                break;

            case 'Не устранено':
                if (userRole === ROLES.EXECUTOR_PNR) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Не устранено', 'Устранено'].includes(item.value)
                        // item.value === 'Устранено'
                    );
                } else if (userRole === ROLES.LEADER_PNR) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Не устранено', 'Предъявлено на устранение', 'Устранено'].includes(item.value)
                    );
                } else if ([ROLES.CURATOR_PNR, ROLES.EXECUTOR_SMR, ROLES.LEADER_SMR].includes(userRole)) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Не устранено', 'Предъявлено на устранение'].includes(item.value)
                        // item.value === 'Предъявлено на устранение'
                    );
                } else {
                    availableStatuses = [];
                }
                break;

            case 'Устранено':
                if (userRole === ROLES.LEADER_PNR || userRole === ROLES.EXECUTOR_PNR) {
                    availableStatuses = availableStatuses.filter(item => 
                       ['Устранено', 'Не устранено'].includes(item.value)
                        // item.value === 'Не устранено'
                    );
                } else {
                    availableStatuses = [];
                }
                break;

            case 'Просрочено':
                if ([ROLES.LEADER_PNR, ROLES.CURATOR_PNR, ROLES.EXECUTOR_SMR, ROLES.LEADER_SMR].includes(userRole)) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Просрочено', 'Предъявлено на устранение'].includes(item.value)
                        // item.value === 'Предъявлено на устранение'
                    );
                }  else if ([ROLES.LEADER_PNR].includes(userRole)) {
                    availableStatuses = availableStatuses.filter(item => 
                        ['Просрочено', 'Предъявлено на устранение', 'Отклонено'].includes(item.value)
                    );
                }else {
                    availableStatuses = [];
                }
                break;

            default:
                // Если статус не установлен или неизвестен, показываем все доступные статусы (кроме системных)
                availableStatuses = availableStatuses;
                break;
        }

        return availableStatuses;
    };

    const handleOpen = () => {
        Keyboard.dismiss(); // Скрываем клавиатуру перед открытием
        setIsFocus(true);
    };

    const handleSelect = (selectedValue: string) => {
        setValue(selectedValue); 
        console.log('Статус селект', selectedValue)
        setIsFocus(false);
        onChange(selectedValue);
        setSearchText(''); // Очищаем поиск после выбора
    };

    const handleOverlayPress = (e: any) => {
        // Проверяем, было ли нажатие вне контейнера модального окна
        if (modalContentRef.current) {
            modalContentRef.current.measureInWindow((x, y, width, height) => {
                const { pageX, pageY } = e.nativeEvent;
                if (
                    pageX < x || 
                    pageX > x + width || 
                    pageY < y || 
                    pageY > y + height
                ) {
                    setIsFocus(false);
                }
            });
        }
    };

    const availableData = getAvailableStatuses();
    const filteredData = searchText 
        ? availableData.filter(item => 
            item.label.toLowerCase().includes(searchText.toLowerCase()))
        : availableData;

    const selectedLabel = value 
        ? ALL_STATUSES.find(item => item.value === value)?.label 
        : title;

    return (
        <View style={{width: '96%'}}>
            <View style={styles.container}>
                {/* Триггер для открытия модального окна */}
                <View ref={dropdownRef}>
                    <TouchableOpacity
                        onPress={handleOpen}
                        style={[styles.dropdown, {borderColor: colorTextBorder}, isFocus && { borderColor: colorTextVersion }]}
                      //  disabled={availableData.length === 0} // Делаем недоступным если нет доступных статусов
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                            <View style={{width: '95%'}}>
                                <Text style={[styles.selectedTextStyle, { 
                                    fontSize: ts(14), 
                                    alignSelf: 'center', 
                                    color: colorTextBorder 
                                }]}>
                                    {post? post: selectedLabel? selectedLabel : 'Не выбрано'}
                                </Text>
                            </View>
                            <View style={{width: '5%', alignItems: 'flex-end'}}>
                                {availableData.length != 0 ?
                                    <Ionicons name='chevron-down' color={colorTextBorder} size={16} />
                                : ''}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Модальное окно с выпадающим списком */}
                <Modal
                    visible={isFocus}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsFocus(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPressOut={handleOverlayPress}
                    >
                        <Animated.View 
                            ref={modalContentRef}
                            style={[
                                styles.modalContent,
                                { 
                                    width: '100%',
                                    maxHeight: '70%',
                                 
                                }
                            ]}
                        >
                            <Text style={[styles.modalHeaderText, {color: colorTextVersion}]}>
                                {label}
                            </Text>
                            <Text style={[styles.selectedValueText, {color: colorTextBorder}]}>
                                {post !== '' && post !== ' ' && post !== undefined ? post : 
                                    <Text style={[styles.selectedTextStyle, { fontSize: ts(14), paddingBottom: 2, alignSelf: 'center', color: colorTextBorder }]}>
                                        Не выбрано
                                    </Text>
                                }
                            </Text>
                            
                            {availableData.length > 0 ? (
                                <>
                                    <TextInput
                                        placeholder="Поиск..."
                                        placeholderTextColor={colorTextBorder}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        style={[
                                            styles.inputSearchStyle, 
                                            { 
                                                height: 42,
                                                fontSize: ts(14),
                                                lineHeight: ts(14) * 1.2,
                                                paddingVertical: 0,
                                                color: colorText,
                                                borderColor: colorTextBorder
                                            }
                                        ]}
                                        autoFocus={isDesktopWeb}
                                    />

                                    <FlatList
                                        data={filteredData}
                                        keyExtractor={item => item.value}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.dropdownItem}
                                                onPress={() => handleSelect(item.value)}
                                            >
                                                <Text style={[styles.itemText, {color: colorText}]}>{item.label}</Text>
                                            </TouchableOpacity>
                                        )}
                                        keyboardShouldPersistTaps="handled"
                                        ListEmptyComponent={
                                            <Text style={{ textAlign: 'center', padding: 16, color: colorTextBorder }}>
                                                Ничего не найдено
                                            </Text>
                                        }
                                    />
                                </>
                            ) : (
                                <Text style={{ textAlign: 'center', padding: 16, color: colorTextBorder }}>
                                    Нет доступных статусов для изменения в соответствие с Вашей ролью
                                </Text>
                            )}
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
        alignItems: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '50%',
        padding: 16,
    },
    modalHeaderText: {
        fontSize: 14,
        paddingBottom: 2,
        fontWeight: '500',
        alignSelf: 'center'
    },
    selectedValueText: {
        fontSize: 16,
        paddingBottom: 14,
        alignSelf: 'center'
    },
    dropdownItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemText: {
        fontSize: 14
    },
    inputSearchStyle: {
        height: 42,
        minHeight: 42,
        maxHeight: 42,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
});

export default ListOfStatusNotes;