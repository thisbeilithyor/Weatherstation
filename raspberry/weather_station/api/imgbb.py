class Imgbb:
    def __init__(self, api):
        self.api = api
        self.key = api.api_keys['imgbb']

        self.url = "https://api.imgbb.com/1/upload"

    def upload_image(self, path):

        params =  {
            'key': self.key
        }
        payload = {
            "image": open(path, 'rb')
        }
        return self.api.post_request(self.url, files=payload, params=params)