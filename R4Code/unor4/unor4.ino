#include "DHT.h"
#include <ArduinoJson.h>


/*DHT11 déclaration varialble const*/
//pin output  dht11
const int dht11PinOut = 2;

//déclaration dht11
DHT dht(dht11PinOut, DHT11);
/*/////////////////////////////////*/


/*RELAY déclaration varialble const*/
//pin output relay
const int relayPinOut1 = 8;
//const int relayPinOut2 = 9;
/*/////////////////////////////////*/



//des valeurs constantes à voir //
//nombre pour le co2 max 
const float co2LevelTrigger = 90;
//nombre pour l'humidité max 
const float humidityLevelTrigger = 30; 
//nombre pour la température max 
const float tempLevelTrigger = 25;


void setup() {
  //baud rate comm du arduino
  Serial.begin(9600);
  Serial.println("-----Start------");

  //lancement dht11
  DHTLaunch();



}


void loop() {
  //aller chercher la température actuelle
  float hLevel = getHumidity();
  float tLevel = getTemperature();
  delay(1000);

}


/**///CODE pour DHT11/**/
//code pour lancer dht 11
void DHTLaunch(){
  dht.begin();
}

float getHumidity(){
  float h = dht.readHumidity();
  Serial.println("humidity : "+String(h));
  return h;
}

float getTemperature(){
  float t = dht.readTemperature();
  Serial.println("temperature : "+String(t));
  return t;
}


/**//**//**//**//**//**/

/**///CODE pour Relay/**/

/**//**//**//**//**//**/

/**///CODE pour MQ-9/**/

/**//**//**//**//**//**/

/**///CODE pour MQ-135/**/

/**//**//**//**//**//**/
