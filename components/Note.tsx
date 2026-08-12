import { StyleSheet, View, TouchableWithoutFeedback, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link} from 'expo-router';

type Props = {
  id: number;
  number: number;
  note: string;
  status: string;
  theme?: 'click';
  onPress?: () => void;
};

export default function Note({id, number, note, status, theme, onPress }: Props) {
  if (theme === 'click') {
    return (

        <TouchableWithoutFeedback onPress={onPress}>
        <View style={{ backgroundColor: '#F8FAFC', flexDirection: 'row', width: '100%', height: 32, paddingTop: 6, justifyContent: 'center', marginBottom: 41}}>

            <View style={{width: '15%', }}>
            <Text style={{ fontSize: 14, color: '#334155', textAlign: 'left' }}>{number}</Text>
            </View>

            <View style={{width: '75%', marginStart: 2}}>
            <Text style={{ fontSize: 14, color: '#334155', textAlign: 'left' }}>{note}</Text>
            </View>
            
            <View style={{width: '7%', marginStart: 2}}>
            <Text style={{ fontSize: 14, color: '#334155', textAlign: 'center'  }}>{status}</Text>
            </View>
        </View>
        </TouchableWithoutFeedback>

    );
  }

  return (
    <View >
      <View style={{ flexDirection: 'row', width: '100%', height: 32, paddingTop: 6, justifyContent: 'center'}}>

      <View style={{width: '15%'}}>
      <Text style={{ fontSize: 16, color: '#1E1E1E', textAlign: 'center' }}>{number}</Text>
      </View>

      <View style={{width: '75%', marginStart: 2}}>
      <Text style={{ fontSize: 16, color: '#1E1E1E', textAlign: 'center' }}>{note}</Text>
      </View>

      <View style={{width: '7%', marginStart: 2}}>
      <Text style={{ fontSize: 16, color: '#1E1E1E', textAlign: 'center'  }}>{status}</Text>
      </View>
      </View>
    </View>
  );
}

