#include <SoftwareSerial.h>
#include <ArduinoJson.h>

SoftwareSerial nodemcu(D6,D5);

void setup() {
  // Set Slave 
  Serial.begin(9600);
  nodemcu.begin(9600);
  while (!Serial) {
  };
}

void loop() {

  //JsonDocument doc;
 // DeserializationError error = deserializeJson(doc, nodemcu);

  //if(error){
  //  Serial.println("error");
  //  return;
 // }
  String d = String(Serial.read());
  Serial.println(d);
  //String d = doc["data"];
  //Serial.println(d);
  
}

