import { Text, TextProps } from './Themed';
import { useWindowDimensions } from 'react-native';

type Props = {
  fontSize: number;
  //handlePress?: () => void;
};


 export default function MonoSizeText(fontSize: number) {
  const fontScale = useWindowDimensions().fontScale;
  
   /* const ts = (fontSize) => {
      return (fontSize / fontScale)
    };*/
    return (fontSize / fontScale);
}