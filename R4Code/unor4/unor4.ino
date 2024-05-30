#include "DHT.h"
#include <ArduinoJson.h>
#include <WiFiClient.h>
#include "WiFiS3.h"
#include "ArduinoHttpClient.h"

//crédentials du réseau
const char* ssid = "HOME"; 
const char* password = "1234567890qwertyuiop";

//variables de l'api
//const char serverAddress[] = "192.168.2.234";  
const char serverAddress[] = "192.168.2.40"; 
const int port = 3000;

/*DHT11 déclaration varialble const*/
//pin output  dht11
const int dht11PinOut = 2;

//déclaration dht11
DHT dht(dht11PinOut, DHT11);
/*/////////////////////////////////*/


/*RELAY déclaration varialble const*/
//pin output relay
const int relayPinOut1 = 7;
//const int relayPinOut2 = 9;
/*/////////////////////////////////*/


/*MQ-9 déclaration varialble const*/
const int mq9PinOut = A0;
/*/////////////////////////////////*/

/*MQ-135 déclaration varialble const val 0 à 1023*/
const int mq135PinOut = A1;
/*/////////////////////////////////*/

/*Boolean d'activation manuel d'échangeur d'air*/
bool globalActivateValue;
/*/////////////////////////////////*/

//des valeurs constantes à voir //
//nombre pour le voc max 
const float vocLevelTrigger = 100; 
//nombre pour le co2 max 
const float co2LevelTrigger = 100; 
//nombre pour l'humidité max 
const float humidityLevelTrigger = 60; 
//nombre pour la température max 
//const float tempLevelTrigger = 25;


void setup() {
  //baud rate comm du arduino
  Serial.begin(9600);
  Serial.println("-----Start------");

  //false du début
  globalActivateValue =false;

  //lancement dht11
  DHTLaunch();

  //pin out pour relay 
  setupRelay();

  //warm up des des composants MQ
  //delay(120000);

  //connection réseau
  ConnectToNetwork();

}


void loop() {
  //aller chercher la température et humidité actuelle
  float hLevel = getHumidity();
  float tLevel = getTemperature();

  //aller chercher le niveau de co2
  float co2Level = getCo2Level();

  //aller chercher niveau de voc
  float vocLevel = getVocLevel();

  //controlleur de relay numéro 1
  relayControlleur(co2Level , vocLevel , hLevel);

  //appel d'api post les valeurs
  httpApiCall(tLevel, hLevel, co2Level,vocLevel);

  //chercher valeur pour activer l'échangeur d'air
  httpGetActivateRelay();
  Serial.println("---------------");
}

/**///CODE pour Wifi connection et httpclient/**/
//connection au reseau
void ConnectToNetwork(){
  int status = WL_IDLE_STATUS;
  WiFi.disconnect();
  delay(20);
  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, password);

    delay(10000);
  }
  Serial.println("Connected to wifi");
}
//appel http du serveur pour post les données
void httpApiCall(float temp, float humidity, float co2, float voc){
  delay(2000);
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient wifi;
    HttpClient client = HttpClient(wifi, serverAddress, port);

    String contentType = "application/json";
    String postData = "{\"co2\":\"" + String(co2) + "\",\"temp\":\"" + String(temp) + "\",\"humidity\":\"" + String(humidity) + "\",\"voc\":\"" + String(voc) + "\"}";
    String endpoint = "/postNewValues";

    client.post(endpoint, contentType, postData);

    int statusCode = client.responseStatusCode();
    String response = client.responseBody();
    client.endRequest();
    client.stop();
    
    Serial.print("Status code: ");
    Serial.println(statusCode);
    Serial.print("Response: ");
    Serial.println(response);
    delay(2000);
  }
}

void httpGetActivateRelay(){
  delay(2000);
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient wifi;
    HttpClient client = HttpClient(wifi, serverAddress, port);

    String contentType = "application/json";

    String endpoint = "/getActiveValue";

    client.get(endpoint);

    int statusCode = client.responseStatusCode();
    String response = client.responseBody();
    if(statusCode == 200){
      //Serial.println(String(response));
      DynamicJsonDocument jsonDoc(1024);
      DeserializationError error = deserializeJson(jsonDoc, response);
      bool activateValue = jsonDoc["activate"];
      if (!error) {
        bool activateValue = jsonDoc["activate"];
        globalActivateValue = activateValue;
        Serial.println("Manuellement activate échangeur d'air :"+String(activateValue));
      }
    }
    client.endRequest();
    client.stop();
    
    Serial.print("Status code: ");
    Serial.println(statusCode);
    Serial.print("Response: ");
    Serial.println(response);
    delay(2000);
  }
}
/**//**//**//**//**//**/

/**///CODE pour DHT11/**/
//code pour lancer dht 11
void DHTLaunch(){
  dht.begin();
}

float getHumidity(){
  delay(1000);
  float h = dht.readHumidity();
  Serial.println("humidity : "+String(h));
  return h;
}

//
float getTemperature(){
  delay(1000);
  float t = dht.readTemperature();
  Serial.println("temperature : "+String(t));
  return t;
}
/**//**//**//**//**//**/

/**///CODE pour Relay/**/
void setupRelay(){
  pinMode(relayPinOut1, OUTPUT);
}


void relayControlleur(float co2Level, float vocLevel , float  humidityLevel){
  delay(1000);
  if(globalActivateValue){
    digitalWrite(relayPinOut1, HIGH);
  }
  else if (co2Level > co2LevelTrigger || vocLevel > vocLevelTrigger || humidityLevel > humidityLevelTrigger){
    //on
    digitalWrite(relayPinOut1, HIGH);
    globalActivateValue = true; 
}else{
    //off
    digitalWrite(relayPinOut1, LOW);
    globalActivateValue = false; 
  }
}
/**//**//**//**//**//**/

/**///CODE pour MQ-9 co2/**/
float getCo2Level(){
  delay(1000);
  float co2Level = analogRead(mq9PinOut);
  Serial.println("co2 level : "+String(co2Level));
  return co2Level;
}
/**//**//**//**//**//**/

/**///CODE pour MQ-135 voc/**/
float getVocLevel(){
  delay(1000);
  float vocLevel = analogRead(mq135PinOut);
  Serial.println("voc level : "+String(vocLevel));
  return vocLevel;
}
/**//**//**//**//**//**/
