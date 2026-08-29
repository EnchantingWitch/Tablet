import { brand } from '@/constants/Colors';
import { useColorBlue, useColorGray, useColorLightGray, useColorRed, useColorText } from "@/hooks/useColorText";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { API_BASE_URL } from '../config/api';
import CustomButton from "./CustomButton";
import { PermissionGuard } from "./PermissionGuard";

type Props = {
  title: string;
  codeCCS: any;
  accessToken: any;
  start: boolean;
};

const Linechart = ({
  title,
  codeCCS,
  accessToken,
  start
}: Props) => {
  const fontScale = useWindowDimensions().fontScale;
  const colorLightGray = useColorLightGray();
  const colorTextGray = useColorGray();
  const colorRed = useColorRed();
  const colorBlue = useColorBlue();
  const [modalStatus, setModalStatus] = useState(false);
  const [data, setData] = useState();
  const ts = (fontSize: number) => {
    return fontSize / fontScale;
  };

  const [lineData, setLineData] = useState([
    {
      value: 0,
      dataPointText: "0",
      label: "30.04",
      dataPointColor: colorBlue,
      dataPointRadius: 2.5,
    },
    {
      value: 0,
      dataPointText: "0",
      label: "07.05",
      dataPointColor: colorBlue,
      dataPointRadius: 2.5,
    },
    {
      value: 0,
      dataPointText: "0",
      label: "14.05",
      dataPointColor: colorBlue,
      dataPointRadius: 2.5,
    },
    {
      value: 0,
      dataPointText: "0",
      label: "21.05",
      dataPointRadius: 3,
      dataPointColor: brand.green,
      dataPointLabelWidth: 1,
    },
    {
      value: 0,
      dataPointText: "0",
      label: "29.05",
      dataPointColor: colorBlue,
      dataPointRadius: 2.5,
    },
    {
      value: 0,
      dataPointText: "0",
      label: "05.05",
      dataPointColor: colorBlue,
      dataPointRadius: 2.5,
    },
    {
      value: 0,
      dataPointText: "0",
      label: "12.05",
      dataPointColor: colorBlue,
      dataPointRadius: 2.5,
    },
  ]);

  const [inputValues, setInputValues] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const [maxValue, setMaxValue] = useState(1);
  const colorText = useColorText();

  useEffect(() => {
    if (codeCCS && accessToken && start) {
      getStaff();
    }
  }, [codeCCS, accessToken, start]);



  useEffect(() => {
    if (data) {
      if (Array.isArray(data)) {
        const updatedLineData = lineData.map((item, index) => {
          if (data[index]) {
            return {
              ...item,
              value: data[index].personnelFact,
              dataPointText:
                data[index].personnelFact?.toString() || item.dataPointText,
              label: data[index].date.replace(/\.\d{4}$/, ""),
            };
          }
          return item;
        });
        setLineData(updatedLineData);
        setInputValues(data.map((item) => item.personnelFact));
      } else if (data.personnelFact !== undefined && data.date) {
        const updatedLineData = [...lineData];
        updatedLineData[3] = {
          ...updatedLineData[3],
          value: data.personnelFact,
          dataPointText: data.personnelFact.toString(),
          label: data.date.replace(/\.\d{4}$/, ""),
        };
        setLineData(updatedLineData);
        setInputValues(data.map((item) => item.personnelFact));
      }
    }
  }, [data]);

  useEffect(() => {
    if (inputValues.length > 0) {
      const max = Math.max(...inputValues);
      setMaxValue(max > 0 ? max : 1); // Убедимся, что maxValue не меньше 1
    }
  }, [inputValues]);

  const handleInputChange = (index: number, value: string) => {
    const newValue = parseInt(value) || 0;
    const newInputValues = [...inputValues];
    newInputValues[index] = newValue;
    setInputValues(newInputValues);
  };

  const getStaff = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/capitals/getStaff/` +
          codeCCS,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const json = await response.json();
      setData(json);
      console.log('responseStaffLineChart:', response)
      console.log('responseStaffLineChart json:', json)
    } catch (error) {
      console.error(error);
    }
  };

  const makeNewData = () => {
    if (!data || !Array.isArray(data)) return;

    const updatedData = data.map((item, index) => ({
      id: item.id,
      personnelPlan: item.personnelPlan,
      personnelFact: inputValues[index],
      date: item.date
    }));
    updateStaff(updatedData);
  };

  const updateStaff = async (dataToUpdate) => {
    try {
      let response = await fetch(
        `${API_BASE_URL}/capitals/updateStaffInf`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToUpdate),
        }
      );
      console.log('ResponseUpdateStaff: ',response)
      console.log('ResponseUpdateStaff json: ',JSON.stringify(dataToUpdate))
      if (response.ok) {
        const jsonData = await response.json();
        setData(dataToUpdate);
        Alert.alert("", "Данные по персоналу обновлены", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      } else {
        throw new Error("Не удалось сохранить данные.");
      }
    } catch (error) {
      console.error("Ошибка при сохранении данных:", error);
    } finally {
      setModalStatus(false);
    }
  };
 const { hasPermission, isLoading } = useAuth();
  // Константная высота контейнера графика
  const CHART_CONTAINER_HEIGHT = 105;
  // Вычисляем высоту графика на основе максимального значения
  const chartHeight = Math.min(CHART_CONTAINER_HEIGHT - 20, maxValue * 3 + 30);
//const chartHeight = Math.min(CHART_CONTAINER_HEIGHT - 20, maxValue * 3 + 30);
  return (
    <View style={{ flex: 1 }}>
      <View>

        <View style={{ flexDirection: "row" }}>
          <View style={{ width: hasPermission('STAFF_EDIT')? "60%":  "100%"}}>
            <Text
              style={{
                color: colorText,
                fontSize: ts(16),
                fontWeight: "bold",
                alignSelf: hasPermission('STAFF_EDIT')?"flex-end" :'center',
              }}
            >
              {title}
            </Text>
          </View>
          <PermissionGuard required='STAFF_EDIT'>
            <TouchableOpacity
              style={{ width: "40%", alignItems: "flex-end" }}
              onPress={() => setModalStatus(true)}
            >
              <Ionicons
                name="person-add-outline"
                size={20}
                color={colorBlue}
              />
            </TouchableOpacity>
          </PermissionGuard>
        </View>

        <View
          style={{
            padding: ts(10),
            borderRadius: 20,
            borderColor: colorText,
            borderWidth: 2,
            backgroundColor: colorLightGray,
            height: CHART_CONTAINER_HEIGHT,
            flexDirection: "row",
            width: "100%",
          }}
        >
          <View
            style={{ width: "25%", alignSelf: "center", flexDirection: "row" }}
          >
            <Text
              style={{
                fontSize: ts(30),
                color: colorBlue,
                fontWeight: "bold",
                alignSelf: "center",
                marginLeft: 10,
              }}
            >
              {lineData[3].value}
            </Text>

            {lineData[3].value - lineData[2].value >= 0 ? (
              <View style={{ flexDirection: "row" }}>
                <Image
                  style={{
                    width: 34,
                    height: 34,
                    tintColor: brand.green,
                    alignItems: "flex-end",
                  }}
                  source={require("../assets/images/arm.svg")}
                />
                <View style={{ marginBottom: -0.5, marginLeft: -10 }}>
                  <Text
                    style={{
                      fontSize: ts(14),
                      color: brand.green,
                      fontWeight: "bold",
                      marginTop: 6,
                      marginRight: 5,
                    }}
                  >
                    {lineData[3].value - lineData[2].value}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: "row" }}>
                <Image
                  style={{
                    width: 34,
                    height: 34,
                    tintColor: colorRed,
                    alignItems: "flex-end",
                  }}
                  source={require("../assets/images/redArm.svg")}
                />
                <View style={{ marginBottom: -0.5, marginLeft: -10 }}>
                  <Text
                    style={{
                      fontSize: ts(14),
                      color: colorRed,
                      fontWeight: "bold",
                      marginTop: 6,
                      marginRight: 5,
                    }}
                  >
                    {Math.abs(lineData[3].value - lineData[2].value)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View
            style={{
              width: "80%",
             justifyContent: 'center',
            //  alignItems: 'center',
              height: chartHeight,
              alignSelf: 'flex-end'
            }}
          >
            <LineChart
              initialSpacing={15}
              data={lineData}
              textColor1={colorText}
              width={Dimensions.get("window").width * 0.62}
              height={chartHeight}
              maxValue={maxValue + Math.ceil(maxValue *0.7)} // Добавляем 20% к максимальному значению для отступа
              noOfSections={4}
              textShiftY={-5}
              textShiftX={-7}
              textFontSize={13}
              hideRules
              hideYAxisText={true}
              hideAxesAndRules={true}
              spacing={Dimensions.get("window").width * 0.092}
              showXAxisIndices
              xAxisIndicesHeight={1}
              xAxisIndicesWidth={250}
              xAxisColor={"gray"}
              xAxisIndicesColor={colorTextGray}
              xAxisLabelTextStyle={{
                fontSize: ts(10),
                color: colorText,
              }}
              spacing1={Dimensions.get("window").width * 0.092}
              yAxisColor={brand.teal}
              color={colorBlue}
              lineSegments={[
                {startIndex: 0, endIndex: 3},
                {startIndex: 3, endIndex: 7, color: useColorBlue(0.4), strokeDashArray: [6,2]},
              ]}
            />
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalStatus}
        onRequestClose={() => setModalStatus(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: 300,
              height: 400,
              padding: 5,
              backgroundColor: "white",
              borderRadius: 10,
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setModalStatus(false)}
              style={{ alignSelf: "flex-end" }}
            >
              <Ionicons name="close-outline" size={30} color={colorText}/>
            </TouchableOpacity>
            <View style={{ justifyContent: "center" }}>
              <View style={{ flexDirection: "row" }}>
                <View style={{ width: "54%", alignItems: "center" }}>
                  <Text
                    style={{
                      color: colorText,
                      fontSize: ts(14),
                      fontWeight: "bold",
                      alignSelf: "center",
                    }}
                  >
                    Дата
                  </Text>
                </View>
                <View style={{ width: "46%", alignItems: "center" }}>
                  <Text
                    style={{
                      color: colorText,
                      fontSize: ts(14),
                      fontWeight: "bold",
                      alignSelf: "center",
                    }}
                  >
                    Количество
                  </Text>
                </View>
              </View>

              {lineData.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    paddingVertical: 3,
                  }}
                >
                  <TextInput
                    style={{
                      textAlign: "center",
                      borderColor: colorTextGray,
                      borderWidth: 1,
                      borderRadius: 6,
                      height: 36,
                      width: 90,
                      includeFontPadding: false,
                      textAlignVertical: "center",
                      lineHeight: ts(12),
                      fontSize: ts(14),
                      color: colorText
                    }}
                    editable={false}
                    value={
                      data?.[index]?.date
                        ? data[index].date.replace(/\.\d{4}$/, "")
                        : item.label
                    }
                  />
                  <TextInput
                    keyboardType={"number-pad"}
                    style={{
                      borderColor: colorTextGray,
                      borderWidth: 1,
                      borderRadius: 6,
                      height: 36,
                      width: 70,
                      paddingBottom: 7,
                      textAlignVertical: "center",
                      fontSize: ts(14),
                      textAlign: "center",
                      color: colorText
                    }}
                    value={inputValues[index]?.toString()}
                    onChangeText={(text) => handleInputChange(index, text)}
                  />
                </View>
              ))}

              <CustomButton title="Сохранить" handlePress={makeNewData} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Linechart;