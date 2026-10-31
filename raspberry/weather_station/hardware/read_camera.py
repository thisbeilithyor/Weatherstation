import cv2
import time
import subprocess

def shoot_image_and_save_locally(path):
    command = ["sudo", "libcamera-jpeg", "-o", path]

    try:
        subprocess.run(command, check=True)
        print("image captured successfully")
    except subprocess.CalledProcessError as e:
        print("Error:", e)