from hardware import Sensors
from api import Api
import time
import datetime

sensors = Sensors(arduino_port="/dev/ttyACM0")
api = Api()

lastTime = 0
measureInterval = 60 * 6 #[in sekunden]

def update_pantry(sensors, img_link, timestamp_str):
            result = api.pantry.update_data(sensors, img_link, timestamp_str)
            while result is None:
                print("upload failed -> trying again")
                result = api.pantry.update_data(sensors, img_link, timestamp_str)
                time.sleep(5)
            print(result)

def get_timestamp():
    timestamp = datetime.datetime.now()
    return timestamp.strftime('%Y-%m-%d %H:%M:%S')

def upload_to_imgbb():
    a = api.imgbb.upload_image(r'/home/pi/Desktop/cur_picture.jpeg')
    return a["data"]["url"]

#mainloop
while True:
    currentTime = time.time()
    if currentTime-lastTime >= measureInterval:
        lastTime = time.time()

        try:
            sensors.read_sensor_data()
            sensors.read_camera()
            img_link = upload_to_imgbb()
            update_pantry(sensors, img_link, get_timestamp())
        except:
            print("CHECK INTERNET CONNECTION")

    time.sleep(1)



#1: Sensorenwerte lesen
#2: Bild machen
#3: => Sensorenwerte + Bildlink -> pantry

#ohne Internetverbindung nicht funktionsfähig