import { useColorBlue, useColorGray, useColorLightGray, useColorRed, useColorText } from '@/hooks/useColorText';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Text, useWindowDimensions, View } from 'react-native';
import { BarChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get('window').width;

type Props = {
    totalQuantity: number;
    blueQuantity: number;
    greenQuantity: number;
    redQuantity: number;
    submitted: number;
    title: string;
};

const PiechartBig = ({ totalQuantity, blueQuantity, greenQuantity, redQuantity, submitted, title }: Props) => {
  const colorText = useColorText();
  const colorLightGray = useColorLightGray();
  const colorTextGray = useColorGray();
  const colorRed = useColorRed();
  const colorBlue = useColorBlue();
  const fontScale = useWindowDimensions().fontScale;
  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};
    
  const pieData = [
  {
    value: totalQuantity,
    color: colorTextGray,
    gradientCenterColor: '#006DFF',
    focused: true,
  },
  {value: blueQuantity-greenQuantity, color: colorBlue, gradientCenterColor: '#3BE9DE'},//синие
  {value: greenQuantity, color: '#16a34a', gradientCenterColor: '#8F80F3'},//динамика
  {value: redQuantity, color: colorRed, gradientCenterColor: '#FF7F97'},//отставание
  
];
 const stackData = [
    {
      stacks: [
        {value: (blueQuantity!==0 || totalQuantity!==0)? blueQuantity*screenWidth : screenWidth, color: (blueQuantity!==0 || totalQuantity!==0)? colorBlue: 'white'},//устраненных
        {value: (blueQuantity!==0 || totalQuantity!==0)?(totalQuantity-blueQuantity)*screenWidth : screenWidth, color: (blueQuantity!==0 || totalQuantity!==0)? colorTextGray: 'white'},//не устраненных
      ],
     
      //spacing: 0,
      //value: 0,
      //barWidth: 0,
      //label: 'Jan',
    },
  ];

/*  stackData.forEach(stackItem => {
    stackItem.topLabelComponent = () => (
      <Text>
        {stackItem.stacks.map(stack => stack.value).reduce((v, a) => v + a)}
      </Text>
    );
  });*/

 const barData = [{value: 5}, {value: 5}];
const renderDot = color => {
  return (
    <View
      style={{
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 10,
      }}
    />
  );
};


const renderLegendComponent = () => {
  return (
    <>
      <View
        style={{
          
          width: '90%',
          alignSelf: 'center',
         // backgroundColor: 'green',
          height: 85,
         marginTop: -95.5,
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row',}}>

          <View style={{flexDirection: 'row', height: 24, width: '50%'}}>  
            <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',}}>
              {/* {renderDot('#8F80F3')}*/}
              <Text style={{color: colorBlue, fontSize: ts(16.7), alignSelf: 'flex-end'}}>{blueQuantity} </Text>{/** здесь над подставить вычисленную сумму green+blue */}
              
            </View>
            <View style={{ alignSelf: 'flex-end', marginBottom: -1, marginRight: -7}}>
              <Image 
                style={{ width: 30, height: 20, tintColor: '#16a34a', alignItems: 'flex-end' }}
                source={require('../assets/images/arm.svg')} 
              />
            </View>
            <View style={{ alignSelf: 'flex-start', height: 24}}>
              <Text
                style={{fontSize: ts(16.7), color: '#16a34a', fontWeight: '400' }}>
                {greenQuantity}
              </Text>
            </View>
          </View>

            <View style={{flexDirection: 'row', height: 24, width: '50%', justifyContent: 'flex-end'}}>  
            <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', }}>
              {/* {renderDot('#8F80F3')}*/}
              <Text style={{color: colorTextGray, fontSize: ts(16.7), alignSelf: 'flex-end'}}>{totalQuantity-blueQuantity} </Text>{/** здесь над подставить вычисленную сумму green+blue */}
              
            </View>
            <View style={{ alignSelf: 'flex-end',   marginBottom: -2, marginRight: -7}}>
              <Image 
                style={{ width: 30, height: 20, tintColor: colorRed, alignItems: 'flex-end' }}
                source={require('../assets/images/delta.svg')} 
              />
            </View>
            <View style={{ alignSelf: 'flex-start', height: 24}}>
              <Text
                style={{fontSize: ts(16.7), color: colorRed, fontWeight: '400' }}>
                {redQuantity}
              </Text>
            </View>
          </View>

        </View>

        <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignSelf: 'center'}}>
          <Text style={{ fontSize: ts(9.3), alignSelf: 'flex-end', color: colorText}}>снято</Text>
          <Text style={{ fontSize: ts(9.3), alignSelf: 'flex-end', color: colorText}}>осталось</Text>
        </View>

      </View>

       
      
    </>
  );
};
  return (
 
   
 <View style={{ flex: 1, }}>
    <View>
     <View style={{}}>
        <Text style={{color: colorText, fontSize: ts(16), fontWeight: 'bold', alignSelf: 'center' }}>
            {title}
        </Text>
     </View>
    <View
      style={{
        padding: ts(10),
        borderRadius: 20,
        borderColor: colorText,
        borderWidth: 2,
        backgroundColor: colorLightGray,//'#F2F2F2'
        height: 105,
        position: 'relative'
      }}>
 <View style={{position: 'absolute',  height: 101, width: '106%', marginLeft: -Dimensions.get('window').width * 0.1}}>
  {/**, marginLeft: '-13.5%' */}
  {/**marginTop: -6, marginLeft: -50 
   * justifyContent: 'flex-end',marginLeft: -46
  */}
          <BarChart
        //  barWidth={300}
       horizontal
        width={Dimensions.get('window').width * 0.85}
       //width={280}
        //height={1005}
        //maxValue={totalQuantity}
        // Отключаем подписи осей
        hideYAxisText={true}    // Убирает текст на оси Y
        hideAxesAndRules={true} // Полностью скрывает оси и линии сетки
        // Отключаем подписи значений
        showValuesAsTopLabel={false} // Убирает значения над столбцами
        showFractionalValues={false}
        // Дополнительные настройки
        disablePress={true}     // Отключает взаимодействие
       // noOfSections={1}        // Минимальное количество секций
        spacing={253}             // Убираем отступы между барами
        initialSpacing={0}
       // endSpacing={120}
        stackData={stackData}
        // barBorderRadius={10}
      /></View>
     </View>
      {renderLegendComponent()}
    </View></View>



  ); 
}

export default PiechartBig;