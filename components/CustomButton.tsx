import { useColorBlue, useColorLightGray } from '@/hooks/useColorText';
import React from "react";
import { Text, TouchableOpacity, useWindowDimensions } from "react-native";

type Props = {
  title: string;
  disabled?: boolean;
  handlePress?: () => void;
};

export default function CustomButton({ title, disabled, handlePress}: Props) {
  const colorCarpet = useColorBlue();
  const colorText = useColorLightGray();
const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};
  return (
    <TouchableOpacity disabled={disabled} style={{ borderRadius: 8, backgroundColor: colorCarpet, width: 272, height: 40, alignSelf: 'center', justifyContent: 'center', marginBottom: 8}}
      onPress={handlePress}>
        
      <Text style={{ fontSize: ts(14), fontWeight: '400', color: colorText, textAlign: 'center', }}>{title}</Text>

    </TouchableOpacity >
  );
}

