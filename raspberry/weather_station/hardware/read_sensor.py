
import re
import time
import sys

def read_sensor(sensor):
    '''
    Sets all Sensor Values to current Value
    :return: nothing
    '''
    waitUntilArduinoReady(sensor)
    get_data_from_arduino(sensor)
    time.sleep(10)
    response = receive_arduino_values(sensor)
    update_sensor_values(sensor, response)

def get_data_from_arduino(sensor):
    sensor.serial.write("data".encode())
    
def waitUntilArduinoReady(sensor):
    while True:
        if sensor.is_arduino_rdy:
            break
        serial_line = sensor.serial.readline().decode().strip()
        print(serial_line)
        if serial_line == "rdy":
            sensor.is_arduino_rdy = True
            break
    #waiting/check until/if arduino is ready
        
def receive_arduino_values(sensor):
    response = ""
    for i in range(7):
        response += sensor.serial.readline().decode().strip()
    print(response)
    return response
    

def update_sensor_values(sensor, response):
    try:
        sensor.temperature = re.search(r'Temperature = (\d+\.\d+)', response).group(1)
        sensor.air_pressure = re.search(r'Pressure = (\d+) hPa', response).group(1)
        sensor.air_moisture = re.search(r'Humidity = (\d+) %', response).group(1)
        sensor.soil_moisture = re.search(r'Soil Moisture = (\d+) %', response).group(1)
        sensor.light_sensor = re.search(r'Light = (\d+) lx', response).group(1)
        sensor.co2 = re.search(r'CO2 = (\d+) ppm', response).group(1)
        sensor.windspeed = re.search(r'Wind Speed = (\d+) km/h', response).group(1)
        sensor.rain = re.search(r'Rain = (\d+) %', response).group(1)
    except:
        Exception("Sensor reading went wrong.")
