import { useColorBlue, useColorGray, useColorLightGray, useColorRed, useColorSkyBlueText, useColorText } from '@/hooks/useColorText';
import { Image } from 'expo-image';
import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { PieChart } from "react-native-gifted-charts";


type Props = {
    totalQuantity: number;
    blueQuantity: number;
    greenQuantity: number;
    redQuantity: number;
    submitted: number;
    title: string;
};

const PiechartSmall = ({ totalQuantity, blueQuantity, greenQuantity, redQuantity, title, submitted }: Props) => {
  const colorText = useColorText();
  const fontScale = useWindowDimensions().fontScale;
  const colorLightGray = useColorLightGray();
  const colorTextGray = useColorGray();
  const colorRed = useColorRed();
  const colorSkyBlueText = useColorSkyBlueText();
  const colorBlue = useColorBlue();

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};
    
  const pieData = [
  {
    value: (totalQuantity===0 && blueQuantity===0 && redQuantity===0)? 1: totalQuantity-blueQuantity-redQuantity,
    color: (totalQuantity===0 && blueQuantity===0 && redQuantity===0 )? 'white' : colorTextGray,
    gradientCenterColor: '#006DFF',
    focused: true,
  },
  {value: blueQuantity-greenQuantity, color: colorBlue, gradientCenterColor: '#3BE9DE'},//синие
  {value: greenQuantity, color: '#16a34a', gradientCenterColor: '#8F80F3'},//динамика
  {value: redQuantity, color: colorRed, gradientCenterColor: '#FF7F97'},//отставание
  
];

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
          flexDirection: 'row',
          alignSelf: 'center',
          height: 40, 
          width: '50%',
          
          //alignItems: 'flex-end'
          //justifyContent: 'center',
        }}>
        <View style={{ height: 22, width: '50%'}}>
         {/* {renderDot('#006DFF')}*/}
          <Text style={{color: colorTextGray, fontSize: ts(20), alignSelf: 'center', fontWeight: 500}}>{totalQuantity-blueQuantity} </Text>{/** здесь над подставить вычисленную разницу */}
          <Text style={{ fontSize: ts(9.3), alignSelf: 'center', color: colorText}}>осталось</Text>
        </View>
        <View style={{  height: 22, width: '50%'}}>
           {/* {renderDot('#8F80F3')}*/}
          <Text style={{color: colorSkyBlueText, fontSize: ts(20), alignSelf: 'center', fontWeight: 500}}>{submitted} </Text>{/** здесь над подставить вычисленную сумму green+blue */}
          <Text style={{ fontSize: ts(9.3), alignSelf: 'center', color: colorText}}>предъявлено</Text>
        </View>
      </View>

    </>
  );
};
  return (
 
   
 <View style={{ flex: 1}}>
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
        backgroundColor: colorLightGray,
        
      }}>
      <View style={{flexDirection: 'row'}}>
      <View style={{padding: 2, alignItems: 'center'}}>
        <PieChart
          data={pieData}
          donut
          //showGradient
          //sectionAutoFocus
          radius={38}
          //semiCircle={true} // делит круг пополам
          //showTooltip={true} //показывает значение сегмента при нажатии
          innerRadius={27}
          innerCircleColor={colorLightGray}
          innerCircleBorderWidth={1.5}
          strokeWidth={1.5}
          strokeColor="white"
          innerCircleBorderColor="white"
          initialAngle={
            totalQuantity-blueQuantity-redQuantity<=0 || totalQuantity-blueQuantity-redQuantity===totalQuantity? 0:
            //(360/180*3.157/((totalQuantity-blueQuantity-redQuantity)*360/totalQuantity)/180*3.157)*180/3.157-((totalQuantity-blueQuantity-redQuantity)*360/totalQuantity)/180*3.157}
            //(360/180*3.1565/((totalQuantity-blueQuantity-redQuantity)*360/totalQuantity)/180*3.1565)*180/3.1565-((totalQuantity-blueQuantity-redQuantity)*360/totalQuantity)/180*3.1565}
            //(360/180*Math.PI/((totalQuantity-blueQuantity-redQuantity)*360/totalQuantity)/180*Math.PI)*180/Math.PI-((totalQuantity-blueQuantity-redQuantity)*360/totalQuantity)/180*Math.PI}
            
            (-(totalQuantity-blueQuantity-redQuantity)/totalQuantity*360/180*Math.PI)}
            //(360/180*Math.PI/((totalQuantity-blueQuantity-redQuantity)*360/totalQuantity)/180*Math.PI)*180/Math.PI-((totalQuantity-blueQuantity-redQuantity)*360/totalQuantity)/180*Math.PI } 
         // initialAngle={totalQuantity/ (Math.PI*(blueQuantity+greenQuantity+redQuantity)) }
        //sAngle={5}
          //focusOnPress={true}
          //toggleFocusOnPress={false}
          //scurvedStartEdges={true}
          centerLabelComponent={() => {
            return (
              <View style={{flexDirection: 'row'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Text
                    style={{fontSize: ts(20), color: colorBlue, fontWeight: 'bold'}}>
                    {blueQuantity}
                  </Text>
                  <Text style={{fontSize: ts(9.33), color: colorText}}>из {totalQuantity}</Text>
                </View>
              </View>
            );
          }}
        />
      </View>
      
        <View style={{justifyContent: 'center'}}>
                  <View style={{flexDirection: 'row', height: 24}}>
                    <View style={{ alignSelf: 'flex-end', marginRight: -5 }}>
                    <Image 
                      style={{ width: 24, height: 24, tintColor: '#16a34a', alignItems: 'flex-end' }}
                      source={require('../assets/images/arm.svg')} 
                    />
                    </View>
                    <View style={{ alignSelf: 'flex-start', height: 16}}>
                      <Text
                        style={{fontSize: ts(13.3), color: '#16a34a', fontWeight: '500' }}>
                        {greenQuantity} за период
                      </Text>
                    </View>
                  </View>

                  <View style={{flexDirection: 'row', height: 24}}>
                    <View style={{ alignSelf: 'flex-end',marginBottom: -0.5, marginRight: -5 }}>
                    <Image 
                      style={{ width: 24, height: 24, tintColor: colorRed, alignItems: 'flex-end' }}
                      source={require('../assets/images/delta.svg')} 
                    />
                    </View>
                    <View style={{ alignSelf: 'flex-start', height: 16}}>
                      <Text
                        style={{fontSize: ts(13.3), color: colorRed, fontWeight: '500'  }}>
                        {redQuantity} от плана
                      </Text>
                    </View>
                  </View>
                </View>
      {renderLegendComponent()}
      </View>
    </View>
    </View>

  </View>

  ); 
}

export default PiechartSmall;