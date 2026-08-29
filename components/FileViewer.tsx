import { brand } from '@/constants/Colors';
import { StyleSheet, Text } from 'react-native';

type Props = {
  selectedFile?: any;
};

export default function FileViewer({ selectedFile }: Props) {
 const FileSource = selectedFile ? "Файл выбран": "Файл не выбран";

  return <Text style={{fontSize: 16, color: brand.textPrimary, fontWeight: '400', marginBottom: 8, textAlign: 'center', }}>{FileSource} {FileSource.name} </Text> ;
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 340,
    borderRadius: 18,
  },
});