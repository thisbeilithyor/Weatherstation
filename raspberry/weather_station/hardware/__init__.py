import serial

from .read_sensor import read_sensor
from .read_camera import shoot_image_and_save_locally

class Sensors:
    def __init__(self, arduino_port = "/dev/ttyACM0", baudrate = 9600):
        self.temperature = 0.0
        self.air_pressure = 0.0
        self.air_moisture = 0.0
        self.soil_moisture = 0.0
        self.light_sensor = 0
        self.co2 = 0.0
        self.windspeed = 0
        self.rain = 0

        self.is_arduino_rdy = False

        self.arduino_port = arduino_port
        self.baudrate = baudrate

        self.serial = self.create_com()
        print(self.serial.readline().decode().strip())
        self.read_sensor_data()

        print(self.temperature)

    def __repr__(self):
        return "Sensors()"

    def __str__(self):
        return f"Temperature:   {self.temperature} °C\n" \
               f"Air Presssure: {self.air_pressure} hPa\n" \
               f"Air Moisture:  {self.air_moisture} %\n" \
               f"Soil Moisture: {self.soil_moisture} %\n" \
               f"Light Sensor:  {self.light_sensor} lx\n" \
               f"CO2:           {self.co2} %\n" \
               f"Windspeed:     {self.windspeed} km/h"#\n" \
               #f"Rain:          {self.rain} %"

    def read_sensor_data(self):
        return read_sensor(self)

    def read_camera(self, path='/home/pi/Desktop/cur_picture.jpeg'):
        return shoot_image_and_save_locally(path)

    def create_com(self):
        return serial.Serial(self.arduino_port, self.baudrate)

