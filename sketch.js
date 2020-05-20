// Copyright (c) 2018 p5ble
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// The serviceUuid must match the serviceUuid of the device you would like to connect
const serviceUuid = "67a8edac-8caa-11ea-bc55-0242ac130003";
const characteristicsUUID = {
  button:"67a8e924-8caa-11ea-bc55-0242ac130003", 
  heater:"67a8ec9e-8caa-11ea-bc55-0242ac130003",
  data: "67a8eb5e-8caa-11ea-bc55-0242ac130003"
}
let heaterCharacteristic;
let dataCharacteristic;

let labels;
let heaterValue = 0;
let dataValue="";
let strarray=["0","1","2","3","4","5","6","7","8"];
let isConnected= false;
let textS=20;

let dataTime= 0;

let dperiod= 2000;
let datas;

function setup() {
  // Create a p5ble class
  myBLE = new p5ble();
  //createCanvas(600, 400);
  let width=window.windowWidth;
  let height=window.innerHeight;
  createCanvas(width,height);
	  
  colorMode(RGB, 0);
//  background(255);
  noStroke();
  textS= height/30;
  textSize(textS);
  // Create a 'Connect and Start Notifications' button
  //const connectButton = createButton('Connect and Start Notifications')
  connectButton = createButton('Connect');
  connectButton.position(20,height-100);
  connectButton.size(200,50);
  connectButton.style('font-size', '24px');
  connectButton.mousePressed(connectAndStartNotify);

  // // Create a 'Stop Notifications' button
  stopButton = createButton('Disconnect');
  stopButton.position(290,height-100);
  stopButton.size(200,50);
  stopButton.style('font-size', '24px');
  stopButton.mousePressed(disconnectToBle);
    
  heaterButton = createButton('Toggle Heater');
  heaterButton.position(560,height-100);
  heaterButton.size(200,50);
  heaterButton.style('font-size', '24px');
  heaterButton.mousePressed(toggleHeater);    
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function connectAndStartNotify() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
  }

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  if (error) console.log('error: ', error);
  
  for(let i = 0; i < characteristics.length; i++){
    console.log(characteristics[i].uuid);
    if(characteristics[i].uuid == characteristicsUUID.heater){
      heaterCharacteristic = characteristics[i];
      //myBLE.startNotifications(heaterCharacteristic, handleHeaterNotify);
    }else if(characteristics[i].uuid == characteristicsUUID.button){
      buttonCharacteristic = characteristics[i];
      myBLE.startNotifications(buttonCharacteristic, handleHeaterNotify);
      //myBLE.read(buttonCharacteristic,handleButton);
    }else if(characteristics[i].uuid == characteristicsUUID.data){
      dataCharacteristic = characteristics[i];
       sleep(1000).then(() => { myBLE.startNotifications(dataCharacteristic, gotdataValue,'string'); });
      
        //myBLE.read(dataCharacteristic,'string',gotdataValue);
    }else {
      console.log("nothing");
    }
    
  }
  isConnected = myBLE.isConnected();
  // Start notifications on the first characteristic by passing the characteristic
  // And a callback function to handle notifications
 // 

  // You can also pass in the dataType
  // Options: 'unit8', 'uint16', 'uint32', 'int8', 'int16', 'int32', 'float32', 'float64', 'string'
  // myBLE.startNotifications(myCharacteristic, handleNotifications, 'string');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// A function that will be called once got characteristics
function handleHeaterNotify(data) {
  console.log('Button: ', data);
  heaterValue = Number(data);
}

function gotdataValue( value) {
  //if (error) console.log('error: ', error);
  console.log('value: ', value);
  dataValue = value;
  // After getting a value, call p5ble.read() again to get the value again
    //myBLE.read(dataCharacteristic,'string', gotdataValue);
  
}
// A function to stop notifications
function stopNotifications() {
  console.log('notifications stopped ');
  
  myBLE.stopNotifications(dataCharacteristic);
  myBLE.stopNotifications(heaterCharacteristic);
   //myBLE.disconnect();
}
function toggleHeater(){
    myBLE.read(heaterCharacteristic, handleHeater);
}

function handleHeater(error, data){
  if (error) console.log('error: ', error);
  console.log('Heater: ', data);
   myBLE.write(heaterCharacteristic, !data);
}

function disconnectToBle() {
  // Disonnect to the device
  isConnected= false;
  //stopNotifications();
  myBLE.disconnect();
  // Check if myBLE is connected
  isConnected = myBLE.isConnected();
}

function onDisconnected() {
  console.log('Device got disconnected.');
  isConnected = false;
}

function draw() {
   if (isConnected) {  
    dataTime= millis();
    background("#e5e5e5");
    //myBLE.read(dataCharacteristic,'string', gotdataValue);   
    if (dataValue == null) {
        console.log("dataValue undefined")
    } else if (dataValue.length == 0){
        console.log("0 length");
    } else {
    let str= dataValue;
    let strnum= str.substr(0,1);
    let strdata= str.substr(1);
    let i= parseInt(strnum);
    strarray[i]= strdata;
    for (let j=0; j<9; ++j) {
      if ((heaterValue == true) && (j == 4)) {
        fill(color("#ff0000"));
        stroke("#ff0000");
      }else{
        fill(color("#0000a0"));
        stroke("#0000a0");
      }  
      text(strarray[j], 50, 1.25*textS*(j+1));
      } 
     }
   }else {
    //myBLE.onDisconnected(onDisconnected);  
    background("#000000");
    fill(color("#ffffff"));
    text('Disconnected :/', 100, 100);
  }
}

