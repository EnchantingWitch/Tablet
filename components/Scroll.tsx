import { useColorBlue, useColorLightGray } from "@/hooks/useColorText";
import React from "react";
import {
  Animated,
  View
} from "react-native";

type Props = {
  completeScrollBarHeight: number; 
  visibleScrollBarHeight: number;
  scrollIndicator: number;
  height?;
};

export default function Scroll({ completeScrollBarHeight, visibleScrollBarHeight, scrollIndicator, height}: Props) {
  const colorScroll = useColorBlue(0.5);
    // длина самого индикатора
    const scrollIndicatorSize = 
    completeScrollBarHeight > visibleScrollBarHeight
      ? (visibleScrollBarHeight * visibleScrollBarHeight) /
        completeScrollBarHeight
      : visibleScrollBarHeight;

  const difference =
    visibleScrollBarHeight > scrollIndicatorSize
      ? visibleScrollBarHeight - scrollIndicatorSize
      : 1;

  const scrollIndicatorPosition = Animated.multiply(
    scrollIndicator,
    visibleScrollBarHeight / completeScrollBarHeight
  ).interpolate({
    inputRange: [0, difference],
    outputRange: [0, difference],
    extrapolate: 'clamp'
  });

    return (
        <View
            style={{
                height: height? '100%' : height,
                width: 6,
                backgroundColor: useColorLightGray(),
                borderRadius: 8
              }}
            >
            <Animated.View
                style={{
                  width: 6,
                  borderRadius: 8,
                  backgroundColor: colorScroll,
                  height: scrollIndicatorSize,
                  transform: [{ translateY: scrollIndicatorPosition }]
                }}
            />
        </View>
    );
}