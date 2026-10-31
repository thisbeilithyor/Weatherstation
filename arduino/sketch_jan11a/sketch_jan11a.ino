#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <BH1750.h>
#include <SoftwareSerial.h>

#define groundMoisturePowerPin 13
#define groundMoistureAnalogPin A0

#define rainDropPowerPin 12
#define rainDropAnalogPin A1

#define interruptPin 3
#define anemometerTime 3 //seconds

//temperatur, air humidity, pressure
#define BME_SCK 13
#define BME_MISO 12
#define BME_MOSI 11
#define BME_CS 10
Adafruit_BME280 bme;

//lightmeter
BH1750 lightMeter;

SoftwareSerial co2sensor(10, 11);
//anemometer
int interruptCounter;
void setup() {
   init_serial_connection();
    
   init_sensor_connections();

   wait_until_ready();
}

void loop() {
  if (checkForGOFromRasp()) {
      delay(1000);
      writeDataToRasp();
  }
}

void init_sensor_connections(){
    //temperatur, air humidity, pressure
    bool status_bme;
    status_bme = bme.begin();
    if (!status_bme) {
      Serial.println("bme-err");
    }
    Serial.println("Test");
    //Ground Moisture
    pinMode(groundMoisturePowerPin, OUTPUT);
    digitalWrite(groundMoisturePowerPin, LOW);

    //Raindrop
    pinMode(rainDropPowerPin, OUTPUT);
    digitalWrite(rainDropPowerPin, LOW);

    Wire.begin();
    //lightmeter
    lightMeter.begin();
    Serial.println("BH1750 initalized");

    //wind
    pinMode(3, INPUT_PULLUP);
}

void wait_until_ready(){
   Serial.println("Wait until ready... (About 2 Minutes)");
   delay(100); //120000
   Serial.println("rdy");
}

void init_serial_connection(){
    Serial.begin(9600);
    Serial.println("Test");
    co2sensor.begin(9600);
    Serial.println("Test");
    delay(50);
}

void writeDataToRasp(){
  Serial.print("Light = ");
  Serial.print(readLight());
  Serial.println(" lx");

  Serial.print("Pressure = ");
  Serial.print(readPressure());
  Serial.println(" hPa");

  Serial.print("Humidity = ");
  Serial.print(readHumidity());
  Serial.println(" %");

  Serial.print("Temperature = ");
  Serial.print(readTemperature());
  Serial.println(" *C");

  Serial.print("Soil Moisture = ");
  Serial.print(readGroundMoisture());
  Serial.println(" %");

  Serial.print("Rain = ");
  Serial.print(readRainDrop());
  Serial.println(" %");

  Serial.print("Wind Speed = ");
  Serial.print(readWindSpeed());
  Serial.println(" km/h");

  Serial.print("CO2 = ");
  Serial.print(readCo2());
  Serial.print(" ppm");
}

boolean checkForGOFromRasp(){
   if (Serial.available()) {
    //String input = Serial.readString();
    //input.trim();
    //if (input.equals("data")) {
      return true;
    //  }
  }
  return false;
}

int readGroundMoisture(){
  digitalWrite(groundMoisturePowerPin, HIGH); //turn on sensor
  delay(10);
  int val = analogRead(groundMoistureAnalogPin);
  digitalWrite(groundMoisturePowerPin, LOW); //turn off sensor
  return map(val, 0, 540, 0, 100); //%
}

float readTemperature(){
  return bme.readTemperature(); //C
}

int readPressure(){
  return bme.readPressure()  / 100.0F; //hpa
}

int readHumidity(){
  return bme.readHumidity(); //%
}

int readLight(){
  return lightMeter.readLightLevel(); //lx
}

int readRainDrop(){
  digitalWrite(rainDropPowerPin, HIGH); //turn on sensor
  delay(10);
  int val = analogRead(rainDropAnalogPin);
  digitalWrite(rainDropPowerPin, LOW); //turn off sensor
  return map(val, 170, 1000, 100, 0);//%
}

int readWindSpeed(){
    interruptCounter = 0;
    attachInterrupt(digitalPinToInterrupt(interruptPin), countup, RISING);
    delay(1000 * anemometerTime);
    detachInterrupt(digitalPinToInterrupt(interruptPin));
    return (float)interruptCounter / (float)anemometerTime * 1.4;
}

int readCo2(){
    byte cmd[9] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
    byte response[9];

    co2sensor.write(cmd, 9);
    co2sensor.readBytes(response, 9);

    if (response[0] == 0xFF && response[1] == 0x86) {
      int high = response[2];
      int low = response[3];
      int ppm = (256 * high) + low;
      return ppm;
    }
  return -1;
}

void countup() {
  interruptCounter++;
}
