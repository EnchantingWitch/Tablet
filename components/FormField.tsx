import { brand } from '@/constants/Colors';
import { useColorGray, useColorText } from "@/hooks/useColorText";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

type Props = {
    title?: string;
    post?: string;
    width?: string;
    editable?: boolean;
    onChange?: (status: string) => void; 
  };
  

const FormField = ({ title, post, editable=true, width, onChange}: Props ) => {
    const colorText = useColorText();
    const [value, setValue] = useState<string>();
    const [isFocus, setIsFocus] = useState(false);
    const colorGray = useColorGray();
     const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

    if (value && editable){
        onChange(value);
    }

     useEffect(() => {
        // Устанавливаем значение из props при изменении post
        if (post !== value) {
          setValue(post || '');
        }
      }, [post]);
    return (
        <View style = {{justifyContent: 'center', width: width? width : '96%', }}>
            {title?
            <View style = {{}}>
                <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>{title}</Text>
            </View> : ''
            }
            <View style = {{}}>
                <TextInput  style={{fontSize: ts(14), backgroundColor: brand.white, borderRadius: 8, borderWidth: 1, borderColor: colorGray, height: 42, paddingVertical: 'auto', color: colorGray, textAlign: 'center', marginBottom: 20}}
                    placeholderTextColor={brand.textPrimary}
                    onChangeText={setValue}
                    value={value}
                    editable={editable}
                />
            </View>
        </View>
    )
}

export default FormField

const styles = StyleSheet.create({
    object1: {
        backgroundColor: brand.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: brand.bgBlue,
        width: 123,
        height: 40,
        paddingTop: 12,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 12,
        color: brand.bgBlue,
        textAlign: 'center',
        marginBottom: 20
    },
    object2: {
        backgroundColor: brand.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: brand.bgBlue,
        width: 272,
        height: 40,
        paddingTop: 12,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 12,
        color: brand.bgBlue,
        textAlign: 'center',
        marginBottom: 20,
    }
})
