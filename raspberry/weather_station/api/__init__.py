from .pantry import Pantry
from .imgbb import Imgbb
import requests


class Api:
    def __init__(self):
        self.api_keys = {"pantry": r"PANTRY_API_KEY",
                         "imgbb": r"IMGBB_API_KEY"}
        self.pantry = Pantry(self)
        self.imgbb = Imgbb(self)

    def get_request(self, url, headers=None, params=""):
        '''
        Does a get Request
        :param url: api_url
        :param headers: header of request
        :return: request in json format
        '''
        if headers is None:
            headers = {"Content-Type": "application/json"}

        request = requests.get(url, headers=headers, params=params, verify=False)
        if request.status_code == 200:
            return request.json()
        return

    def put_request(self, url, params="", headers=None):
        if headers is None:
            headers = {"Content-Type": "application/json"}

        request = requests.put(url, json=params, verify=False, headers=headers)
        if request.status_code == 200:
            return request.json()
        return

    def post_request(self, url, files="", params=""):
        request = requests.post(url, files=files, verify=False, params=params)
        if request.status_code == 200:
            return request.json()
        return request.status_code
