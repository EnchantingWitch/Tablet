import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

type Position = {
  bottom?: number;
  right?: number;
  left?: number;
  top?: number;
};

type Props = {
  visible: boolean; // boolean вместо string
  position?: Position; // Объект с позицией вместо string
  onPress: () => void; // Без параметра status
};

const FloatingScrollToTop = ({ 
  visible, 
  onPress, 
  position = { bottom: 30, right: 20 } 
}: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: visible ? 1 : 0,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible && fadeAnim.__getValue() === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: position.bottom,
          right: position.right,
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 0.95],
                outputRange: [0, 0.95],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <AntDesign name="upcircleo" size={40} color='rgba(0, 51, 102, 0.3)' />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingScrollToTop

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  button: {
    
    backgroundColor: 'rgba(255, 255, 255, 0.4)', //'rgba(0, 122, 255, 0.9)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});