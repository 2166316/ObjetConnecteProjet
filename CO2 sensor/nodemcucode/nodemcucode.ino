#include<ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

//wifi ssid
const char* ssid = "HOME"; 
const char* password = "1234567890qwertyuiop"; 


void setup() {
  // put your setup code here, to run once:

  //début de connection wifi
  setupNodeMcu();

  delay(4000);

  delay(4000);
  setupBlinkLed();

  //output 5v 
  outputHighContinuD3();

}

void loop() {
  // put your main code here, to run repeatedly:
  blinkLed();

  //lire le data input sur la pin A0
  delay(5000);
  int sensorValue = analogRead(A0); 
  Serial.begin(9600);
  Serial.print("Valeur analog co2: "); 
  Serial.println(sensorValue); 


  // créer le json
  StaticJsonDocument<200> jsonDocument;
  jsonDocument["co2"] = sensorValue;

  // serialize the JSON 
  String jsonString;
  serializeJson(jsonDocument, jsonString);
  Serial.println("JSON data: " + jsonString);

  // appel api
  callApi(jsonString);
}

//alimentation 5v pour sensor c02//
void outputHighContinuD3(){
   pinMode(D3,OUTPUT);
   digitalWrite(D3,HIGH);
}

//pour setup la connection de nodemcu //////////////
void setupNodeMcu(){
  //début de connection wifi
  Serial.begin(9600);
  Serial.println("Connecting to wifi");
  WiFi.disconnect();
  delay(20);
  WiFi.begin(ssid,password);


  while(WiFi.status() != WL_CONNECTED ){
    delay(500);
    Serial.println(".");
  }
  Serial.println("---------");
  Serial.print("Ipaddress : ");
  Serial.print(WiFi.localIP());
  //Serial.print(WiFi.ip());
  Serial.println("");
}
///////////////////////////////////////////////////////

//pour flasher la led pour indiquer le fonctionnement//
void setupBlinkLed(){
  pinMode(D4,OUTPUT);
  //Serial.begin(9600);
}
void blinkLed(){
  //Serial.println("flash");
  digitalWrite(D4,HIGH);
  delay(1000);
  digitalWrite(D4,LOW);
  delay(1000);
}
/////////////////////////////////////////////////////////


//call node api////
void callApi(String  jsonData){

  //Serial.println(c02Val);

  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    http.begin(client,"http://192.168.2.234:5000/api/co2");


    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonData);

    if(httpResponseCode == 200){
      Serial.println("Succes");
      String retVal = http.getString();
      //Serial.println("Message:"+retVal);
    }else{
      Serial.println("Erreur");
    }
    http.end();
  }
  Serial.println(""); 
}


