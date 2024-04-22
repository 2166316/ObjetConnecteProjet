#include "DHT.h"
#include <SPI.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

//pin output dht11
const int dht11PinOut = 2;

//déclaration dht11
DHT dht(dht11PinOut, DHT11);

//nombre pour le co2 max 
const float co2LevelTrigger = 90;
//nombre pour l'humidité max 
const float humidityLevelTrigger = 30; 
//nombre pour la température max 
const float tempLevelTrigger = 25;

//pin output relay
const int relayPinOut = 8;

//slave pin
SoftwareSerial nodeMcu(5, 6);

void setup() {
  Serial.println("-----Start------");
  //lance dht11
  dht.begin();

  //baud rate comm du arduino
  Serial.begin(9600);

  //init  espserial
  nodeMcu.begin(9600);
  delay(1000);

  //relay indique output
  pinMode(relayPinOut,OUTPUT);
}

// 1 : Envoi en premier humidité
// 2 : Envoi en deuxième température
// 3 : Envoi en troisième c02 niveau

void loop() {
  float hLevel = getHumidity();
  float tLevel = getTemperature();
  delay(1000);

  float co2Level = getCo2Level();
  delay(1000);
  Serial.println("");

  //pour le relay
  /*Serial.println("on");
  digitalWrite(8, HIGH);   
  delay(3000);
  Serial.println("off");
  digitalWrite(8, LOW);    
  delay(3000);*/

  //fermer le plancher chauffant
  if(co2Level > co2LevelTrigger || hLevel > humidityLevelTrigger){
    //on
    digitalWrite(relayPinOut, HIGH); 
  }else{
    //off
    digitalWrite(relayPinOut, LOW); 
  }

  //partir le système de ventilation
  if(tLevel > tempLevelTrigger){
    //on
    //digitalWrite(relayPinOut, HIGH); 
  }else{
    //off
    //digitalWrite(relayPinOut, LOW); 
  }
  delay(3000);
}

float getCo2Level(){
  float co2Level = analogRead(A0);
  //Serial.println("co2 level : "+String(co2Level));
  //envoi au mcu
  sendDataToNodeMcu("co2Level",co2Level);
  return co2Level;
}

float getHumidity(){
  float h = dht.readHumidity();
  //Serial.println("humidity : "+String(h));
  //envoi au mcu
  sendDataToNodeMcu("humidity",h);
  return h;
}

float getTemperature(){
  float t = dht.readTemperature();
  //Serial.println("temperature : "+String(t));
  //envoi au mcu
  sendDataToNodeMcu("temperature",t);
  return t;
}

//envoi data nodemcu
void sendDataToNodeMcu(String type, float value){

  delay(2000);
  JsonDocument doc;
  //JsonObject& data = doc.createObject();
  String v = String(type+" - ")+String(value);
  doc["test"] = v;

  //send
  serializeJson(doc, Serial);
}
