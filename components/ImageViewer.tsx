import { StyleSheet } from 'react-native';
//import { Image, type ImageSource } from "expo-image";
import { Image, type ImageURISource } from 'react-native';

type Props = {
  imgSource: ImageURISource;
  selectedImage?: string;
};

export default function ImageViewer({ imgSource, selectedImage }: Props) {
 const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Image source={imageSource} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 340,
    borderRadius: 18,
  },
});