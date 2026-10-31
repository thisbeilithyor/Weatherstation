from time import strftime
import datetime


class Pantry:
    def __init__(self, api):
        self.api = api
        self.key = api.api_keys['pantry']

    def get_data(self):
        return self.api.get_request(f'https://getpantry.cloud/apiv1/pantry/{self.key}/basket/wetterstation')

    def update_data(self, Sensors, img_link, timestamp_str):
        return self.api.put_request(f'https://getpantry.cloud/apiv1/pantry/{self.key}/basket/wetterstation',
                                    params={
                                           "temperature": float(Sensors.temperature),
                                           "air_pressure": Sensors.air_pressure,
                                           "air_moisture": Sensors.air_moisture,
                                           "soil_moisture": Sensors.soil_moisture,
                                           "light_sensor": Sensors.light_sensor,
                                           "co2": Sensors.co2,
                                           "windspeed": Sensors.windspeed,
                                           "rain": Sensors.rain,
                                           "img_link": img_link,
                                           "timestamp": timestamp_str
                                        })

