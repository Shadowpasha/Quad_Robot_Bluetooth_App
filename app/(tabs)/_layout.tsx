import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Text, PermissionsAndroid, Platform, Modal, Pressable, Alert, FlatList} from 'react-native';
import styled from 'styled-components';
import RNBluetoothClassic, { BluetoothDevice, BluetoothDeviceEvent, BluetoothDeviceReadEvent } from 'react-native-bluetooth-classic';
import { useState, useEffect, useRef } from 'react';
import Slider from "react-native-sliders";

// import module
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// import module
import { ReactNativeJoystick } from "@korsolutions/react-native-joystick";

const MainView = styled(View)`
  width: 100%;
  height: 100%;
  flex:1;
  background-color: #9f92ff;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Row_View = styled(MainView)`
  padding: 0px;
  margin: 0px;
  justify-content: space-around;
`;

const ModalView = styled(View)`
  width: 30%;
  height: 90%;
  background-color: #eceaffc7;
  borderRadius: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-left: 150px;
`;

const ColumnView = styled(View)`
  width: 75px;
  height: 100%;
  /* background-color: #9f92ff; */
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

const ColumnView_wide = styled(ColumnView)`
  width: 150px;
  margin:10px;
  alignItems: "stretch";
`;

const ColumnView_slider = styled(ColumnView_wide)`
  justify-content: center;
  height:30%;
  width:100%;
  margin:0px;
  margin-bottom: 15px;
`;

const ColumnView_joystick = styled(ColumnView)`
  width: 200px;
  margin: 12px;
`;

const Button_main = styled(TouchableOpacity)`
  width: 66px;
  height: 66px;
  background-color: #552e7b;
  borderRadius: 40px;
  padding:2px;
  justify-content:center;
  align-items:center;
`;

const Rect_Button_main = styled(Button_main)`
  width: 120px;
  height: 50px;
  borderRadius: 0px;
  margin: 17px;
  margin-bottom: 5px;
  margin-top: 5px;
`;

const React_button_small = styled(Rect_Button_main)`

  width: 95px;
  height: 35px;
`;

const Text_main = styled(Text)`
  color: aliceblue;
  font-size: 40px;
  font-weight: bold;
`;

const Text_smaller_main = styled(Text_main)`
  font-size: 20px;
`;

const Text_smallerer_main = styled(Text_smaller_main)`
  color: #552e7b; 
  font-size: 15px;
  margin:0px;
  padding:0px;
  text-align: center;
`;

const Text_smaller_purple = styled(Text_smaller_main)`
  font-size: 21px;
  color: #552e7b;
  text-align:center;
  margin:0px;
`;

const Render_item = styled(Rect_Button_main)`
  background-color: #ffffff00;
  width: 100%;
  margin:4px;
  padding: 1px;
`;

const Slider_main = styled(Slider)`
  margin: 0px;
  padding:0px;
`;

const Text_item = styled(Text_smaller_purple)`
  font-size: 22px;
`;

async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      {
        title: "Location permission for bluetooth scanning",
        message:
          "Grant location permission to allow the app to scan for Bluetooth devices",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Location permission for bluetooth scanning granted");
    } else {
      console.log("Location permission for bluetooth scanning denied");
    }


    const granted_ble = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth permission for bluetooth scanning",
        message:
          "Grant location permission to allow the app to scan for Bluetooth devices",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    if (granted_ble === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("connection permission for bluetooth scanning granted");
    } else {
      console.log("connection permission for bluetooth scanning denied");
    }
  } catch (err) {
    console.warn(err);
  }
}



requestLocationPermission();


export default function TabLayout() {

  const [modalVisible, setModalVisible] = useState(false);
  const [slider1values, setSlider1values] = useState([0.0]);
  const [slider2values, setSlider2values] = useState([0.0]);
  const peripherals = new Map()
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState();
  const [connectedStatus, setConnectedStatus] = useState("Disconnected");
  const connected_ref = useRef(connectedStatus);
  const device_ref = useRef(connectedDevice);
  const [mode, setMode] = useState("Walk");
  const [step_height, setStep_height] = useState("0.02");
  const [joystick_values, setjoystick_values] = useState([0.0,0.0]);
  const [imu_pitch, setImu_pitch] = useState("0.01");
  const [imu_roll, setImu_roll] = useState("0.00");

  
  function onDeviceDisconnected(event: BluetoothDeviceEvent) {
    setConnectedStatus("Disconnected");
    console.log("Disconnected");
  };

  async function onReceivedData(event: BluetoothDeviceReadEvent) {
    // console.log(event);
    // const message = await connectedDevice.read();
    console.log(event.data);
    const array = event.data.split(" ");
    setImu_pitch(array[0]);
    setImu_roll(array[1]);
    setMode(array[2]);
    // setStep_height(array[3].slice(0,-1));
  };


  const searchAndConnectToDevice = () => {
    if(connectedStatus == "Connected"){
      connectedDevice.disconnect().then(()=>{
          console.log("disconnected");
          setConnectedStatus("Disconnected")
      });
    }
    setModalVisible(true);
    RNBluetoothClassic.isBluetoothAvailable().then((available) => {
      console.log('Bluetooth is ', available);
    });

    RNBluetoothClassic.isBluetoothEnabled().then((enabled) => {
      console.log('Bluetooth is ', enabled);
    });

    RNBluetoothClassic.getBondedDevices([]).then(results => {
      if (results.length === 0) {
        console.log('No connected bluetooth devices');
      } else {
        for (let i = 0; i < results.length; i++) {
          let peripheral = results[i];
          peripheral.connected = true;
          
          peripherals.set(peripheral.id, peripheral);
          setConnectedDevices(Array.from(peripherals.values()));
        }
      }
    });

  };

    const connectToPeripheral = device => {
      console.log('Trying to Connect ...');
      setConnectedStatus("Connecting...")
      device.connect().then((result)=>{
          if(result == true){
            setConnectedStatus("Connected");
            setConnectedDevice(device);
            setModalVisible(false);
            RNBluetoothClassic.onDeviceDisconnected(onDeviceDisconnected);
            RNBluetoothClassic.onBluetoothDisabled(onDeviceDisconnected);
            device.onDataReceived((data) => {onReceivedData(data)});
          }else{
            setConnectedStatus("Failed");
          }
      });
    };

    function ButtonPressed(pressed : string) {
      if(connectedStatus === "Connected"){
        connectedDevice.write(pressed+"\n");
      }
    }

    function SlideChange(slideNumber, slide) {
      if(connectedStatus === "Connected"){
        if(slideNumber == 1){
          setSlider1values(slide);
          connectedDevice.write("S1" + (Math.round(slider1values[0] * 10)).toString() + "\n");
        }else{
          setSlider2values(slide);
          connectedDevice.write("S2" + (Math.round(slider2values[0] * 10)).toString() + "\n");
        }
      }
    }

    const mapNumRange = (num, inMin, inMax, outMin, outMax) =>
      ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

    function Joystick_Send(Value,Joy_Id) {
      if(connected_ref.current == "Connected"){
        let x = mapNumRange(Value.position.x, -25.0,125.0, -1.0, 1.0)
        let y = mapNumRange(Value.position.y, -25.0,125.0, -1.0, 1.0)
        if(Joy_Id == 1){
          device_ref.current.write("J1" + String(Math.round((x * 100)) ) + " " + String(Math.round((y * 100)) ) +  "\n");
        }else{
          device_ref.current.write("J2" + String(Math.round((x * 100)) ) + " " + String(Math.round((y * 100)) ) +  "\n");

        }
        
      }

    }

    useEffect(() => {

      connected_ref.current = connectedStatus;
      device_ref.current = connectedDevice;
      // adding event listeners on mount here
      return () => {
          // cleaning up the listeners here
      }
   }, [connectedStatus, connectedDevice]);


  return (
    <MainView>
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <ModalView >
              {connectedDevices.length > 0 ? (
              <FlatList
                data={connectedDevices}
                showsVerticalScrollIndicator ={false}
                renderItem={({item}) =>  (<Render_item onPress={()=>{connectToPeripheral(item)}} peripheral={item}>
                   <Text_item> {item.name} </Text_item> 
                  </Render_item> 
                 ) }
                keyExtractor={item => item.id}
              />
            ) : (
              <Text_smaller_purple>No connected devices</Text_smaller_purple>
            )}
            <Rect_Button_main onPress={()=>{setModalVisible(false)}}>
              <Text_smaller_main>
                Close
              </Text_smaller_main>
            </Rect_Button_main>
          </ModalView>
        </Modal>
      
      <ColumnView_joystick>
            <React_button_small onPressIn={()=>{ButtonPressed("LB")}} onPressOut={()=>{ButtonPressed("S")}}>
              <Text_smaller_main>L1</Text_smaller_main>
            </React_button_small>
            
            {/* <Row_View>
              <ColumnView>
              <Button_main onPressIn={()=>{ButtonPressed("L1")}} onPressOut={()=>{ButtonPressed("S")}}>
                <Text_main>◄</Text_main>
              </Button_main>
              </ColumnView>

              <ColumnView>
              <Button_main onPressIn={()=>{ButtonPressed("F1")}} onPressOut={()=>{ButtonPressed("S")}}>
                <Text_main>▲</Text_main>
              </Button_main>

              <Button_main onPressIn={()=>{ButtonPressed("B1")}} onPressOut={()=>{ButtonPressed("S")}}>
                <Text_main>▼</Text_main>
              </Button_main>
              </ColumnView>

              <ColumnView>
              <Button_main onPressIn={()=>{ButtonPressed("R1")}} onPressOut={()=>{ButtonPressed("S")}}>
                <Text_main>►</Text_main>
              </Button_main>
              </ColumnView>
            </Row_View> */}

              <GestureHandlerRootView>
              <ReactNativeJoystick color="#552e7b" radius={75} onMove={(data) => Joystick_Send(data,1)} onStop={(data) => ButtonPressed("S")} />
             {/* <JoyStick
                wrapperColor="#f0f0f0"
                nippleColor="#d3d3d3"
                wrapperRadius={70}
                nippleRadius={20}
                borderWidth={5}
                fingerCircleRadius={20}
                onMove={(data) => {
                  // Joystick_Send(data)
                }}
                onTouchDown={(data) => {
                  // Joystick_Send(data)
                }}
                onTouchUp={(data) => {
                  // Joystick_Send(data)
                }}
              /> */}
            </GestureHandlerRootView> 

        <Text_smaller_purple>Current Mode: {mode}</Text_smaller_purple>
      </ColumnView_joystick>
 
      <ColumnView>
      <Button_main onPressIn={()=>{ButtonPressed("A")}} onPressOut={()=>{ButtonPressed("S")}}>
        <Text_main>A</Text_main>
      </Button_main>

      <Button_main onPressIn={()=>{ButtonPressed("B")}} onPressOut={()=>{ButtonPressed("S")}}>
        <Text_main>B</Text_main>
      </Button_main>

      <Button_main onPressIn={()=>{ButtonPressed("C")}} onPressOut={()=>{ButtonPressed("S")}}>
        <Text_main>C</Text_main>
      </Button_main>
      </ColumnView>

      <ColumnView>
      <Button_main onPressIn={()=>{ButtonPressed("D")}} onPressOut={()=>{ButtonPressed("S")}}>
        <Text_main>D</Text_main>
      </Button_main>

      <Button_main onPressIn={()=>{ButtonPressed("X")}} onPressOut={()=>{ButtonPressed("S")}}>
        <Text_main>X</Text_main>
      </Button_main>

      <Button_main onPressIn={()=>{ButtonPressed("Y")}} onPressOut={()=>{ButtonPressed("S")}}>
        <Text_main>Y</Text_main>
      </Button_main>
      </ColumnView>

      <ColumnView_wide>
      <ColumnView_slider>
      <Rect_Button_main onPress={searchAndConnectToDevice}>
        <Text_smaller_main>{connectedStatus == "Connected"? "Disconnect" : "Connect"}</Text_smaller_main>
      </Rect_Button_main>
      <Text_smallerer_main>Status: {connectedStatus}</Text_smallerer_main>
      </ColumnView_slider>
      <ColumnView_slider>
      <Text_smallerer_main> Step Speed</Text_smallerer_main>
      <Slider_main value={slider1values} onValueChange={(value) => SlideChange( 1, value )} step={0.1} thumbTintColor={"#552e7b"} minimumTrackTintColor={"#381d53"} maximumTrackTintColor={"#FFFFFF"} onSlidingComplete={()=>{ButtonPressed("S")}} />
      <Text_smallerer_main> Angle Scale</Text_smallerer_main>
      <Slider_main value={slider2values} onValueChange={(value) => SlideChange(2, value )} step={0.1} thumbTintColor={"#552e7b"}  minimumTrackTintColor={"#381d53"} maximumTrackTintColor={"#FFFFFF"} onSlidingComplete={()=>{ButtonPressed("S")}}/>
      </ColumnView_slider>

      <Rect_Button_main onPressIn={()=>{ButtonPressed("ST")}} onPressOut={()=>{ButtonPressed("S")}}>
        <Text_smaller_main>Start</Text_smaller_main>
      </Rect_Button_main>

      </ColumnView_wide>
        
      <ColumnView_joystick>

      <React_button_small onPressIn={()=>{ButtonPressed("RB")}} onPressOut={()=>{ButtonPressed("S")}}>
              <Text_smaller_main>R1</Text_smaller_main>
            </React_button_small>

     
        {/* <Row_View>
          <ColumnView>
          <Button_main onPressIn={()=>{ButtonPressed("L2")}} onPressOut={()=>{ButtonPressed("S")}}>
            <Text_main>◄</Text_main>
          </Button_main>
          </ColumnView>

          <ColumnView>
          <Button_main onPressIn={()=>{ButtonPressed("F2")}} onPressOut={()=>{ButtonPressed("S")}}>
            <Text_main>▲</Text_main>
          </Button_main>

          <Button_main onPressIn={()=>{ButtonPressed("B2")}} onPressOut={()=>{ButtonPressed("S")}}>
            <Text_main>▼</Text_main>
          </Button_main>
          </ColumnView>

          <ColumnView>
          <Button_main onPressIn={()=>{ButtonPressed("R2")}} onPressOut={()=>{ButtonPressed("S")}}>
            <Text_main>►</Text_main>
          </Button_main>
          </ColumnView>
        </Row_View> */}

            <GestureHandlerRootView>
            <ReactNativeJoystick color="#552e7b" radius={75} onMove={(data) => Joystick_Send(data,2)}  onStop={(data) => ButtonPressed("S")}/>
             {/* <JoyStick
                wrapperColor="#ffffff"
                nippleColor="#ffffff"
                wrapperRadius={70}
                nippleRadius={20}
                borderWidth={5}
                fingerCircleRadius={20}
                onMove={(data) => {
                  // console.log(data);
                }}
                onTouchDown={(data) => {
                  // console.log(data);
                }}
                onTouchUp={(data) => {
                  // console.log(data);
                }}
              /> */}
            </GestureHandlerRootView> 
            
      <Text_smaller_purple>IMU Roll: {imu_roll}º</Text_smaller_purple>
      <Text_smaller_purple>IMU Pitch: {imu_pitch}º</Text_smaller_purple>
      </ColumnView_joystick>
 
     
    </MainView>
  );
}
