from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from os import path, environ
from PIL import Image
import tensorflow as tf
import numpy as np

tf.get_logger().setLevel('ERROR')
tf.autograph.set_verbosity(3)

ai_model = load_model(path.join(path.dirname(__file__), 'models/model.hdf5'))
DEFAULT_IMAGE_SIZE = 224

def preprocess_img(img_path):
        try:
            img_side_size = int(environ.get('MODEL_IMAGE_SIZE', DEFAULT_IMAGE_SIZE))
        except:
            img_side_size = DEFAULT_IMAGE_SIZE

        pil_img = Image.open(img_path).convert('RGB')
        img_resized = pil_img.resize((img_side_size, img_side_size))

        return np.array([img_to_array(img_resized)])


def predict_result(images):
    return ai_model.predict(np.vstack(images), batch_size=32)
