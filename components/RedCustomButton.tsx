import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import React from "react";

type Props = {
    title: string;
    handlePress?: () => void;
};

export default function CustomButton({ title, handlePress }: Props) {

    return (
        <TouchableOpacity style={{ borderRadius: 8, backgroundColor: '#DC2626', width: 272, height: 40, paddingVertical: 8, alignSelf: 'center', marginBottom: 5 }}
            onPress={handlePress}>
            <Text style={{ fontSize: 16, fontWeight: '400', color: '#F5F5F5', textAlign: 'center', }}>{title}</Text>
        </TouchableOpacity >
    );
}

