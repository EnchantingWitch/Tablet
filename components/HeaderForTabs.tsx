import { brand } from '@/constants/Colors';
import { useColorText } from "@/hooks/useColorText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import Scroll from "./Scroll";

type Props = {
  nameTab?: string; //Структура/Документация/Замечания и тд
  capitalCSName: string;
  path?: string
  role?: string
};

export default function HeaderForTabs({ nameTab, capitalCSName, path, role}: Props) {
  const colorText = useColorText();
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return fontSize / fontScale;
  };
  const [toPath, setToPath] = useState("/objs/objects")

    useEffect(() => {
      if (role && role === 'ADMIN'){setToPath("../admin/objs");}
      else setToPath(path || "/objs/objects");
    }, [path, role]);

    const BOTTOM_SAFE_AREA =
        Platform.OS === "android" ? StatusBar.currentHeight : 0;
    const scrollRef = useRef(null); //для скрола заголовка
    const [lineCount, setLineCount] = useState(1);//количество строк в заголовке 
    const textRef = useRef(null); //для скрола заголовка
    const router = useRouter();
    const [completeScrollBarHeight, setCompleteScrollBarHeight] = useState(1);
      const [visibleScrollBarHeight, setVisibleScrollBarHeight] = useState(0);
      const [isScrollable, setIsScrollable] = React.useState(false);
      const scrollIndicator = useRef(new Animated.Value(0)).current;
return (
  <View>
    <View style={{ flexDirection: "row", paddingTop: BOTTOM_SAFE_AREA + 15, marginBottom: 0, width: '100%' }}>
      {/**иконка домика с куском полоски, 19*/}
        <TouchableOpacity style={{  width: '10%',height: 38, justifyContent: 'center'}} onPress={() => router.replace( toPath)}>
          <Ionicons
            name="home-outline"
            size={25}
            style={{ alignSelf: "center", color: colorText }}
          />
        </TouchableOpacity>
      {/**наименование объекта со скролом и полоской */}
        <View style={{ flexDirection: 'column', }}>
          {/**наименование объекта со скролом */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'column', width: '92%', paddingStart: '3%', justifyContent: 'center', height: 38, }}>
              <ScrollView
                style={{
                  maxHeight: lineCount > 1 ? 38: 19,//20 размер шрифта, т.е высота одной строки
                  overflowY: lineCount > 1 ? 'scroll' : 'scroll'//hidden
                }}
                ref={scrollRef}
                onContentSizeChange={() => scrollRef.current?.scrollTo({ y: 0, animated: false })}
                showsVerticalScrollIndicator={false}
                persistentScrollbar={false}
                scrollEventThrottle={16}
                    onContentSizeChange={(_, height) => {
                      setCompleteScrollBarHeight(height);
                      if(visibleScrollBarHeight!= 0){
                      setIsScrollable( Math.abs(height-visibleScrollBarHeight) > 1.1);
                      } }}
                    onLayout={({ nativeEvent }) => {
                      const height = nativeEvent.layout.height;
                      setVisibleScrollBarHeight(height);
                      if(completeScrollBarHeight!= 1){
                      setIsScrollable(Math.abs(completeScrollBarHeight - height) > 1.1);
                     }}}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { y: scrollIndicator } } }],
                      { useNativeDriver: false }
                    )}
              >
                <Text
                  ref={textRef}
                  style={{
                    fontWeight: '400',
                    fontSize: ts(16),
                    textAlign: 'left',
                    textAlignVertical: 'center',
                    color: colorText,
                    paddingVertical: 0,
                    lineHeight: ts(19),// display: 'inline-block',
                    width: '100%' 
                  }}
                  onTextLayout={({ nativeEvent: { lines } }) => setLineCount(lines.length)}
                >
                  {capitalCSName}
                </Text>
              </ScrollView>
            </View>
          
            {isScrollable &&
              <Scroll completeScrollBarHeight={completeScrollBarHeight} 
              visibleScrollBarHeight={visibleScrollBarHeight} 
              scrollIndicator={scrollIndicator}
              height={lineCount > 1 ? 52: 26}/>
               }

          </View>
          
        </View>
      </View>
       <View style={{
            width: '100%', // Ширина полоски
            height: 1, // Толщина полоски
            marginRight: '20%',
            backgroundColor: brand.bgBlue, // Цвет полоски
          }} />
       {nameTab? 
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: ts(20),
                  textAlign: 'center',
                  color: colorText,
                  paddingVertical: 0,
                  paddingBottom: 8
                }}
              >
                {nameTab}
              </Text>
              : ''}
  </View>
  );
}