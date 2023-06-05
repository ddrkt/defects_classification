import tensorflow as tf
from tensorflow import keras
from keras import layers
from keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras import layers
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.applications import efficientnet
from tensorflow.keras.preprocessing import image
import argparse
import os
import numpy as np
import pdb

print(tf.__version__)

DATASETS_LOCATION = os.path.join(os.path.dirname(__file__), "datasets")
CHECKPOINTS_LOCATION = os.path.join(os.path.dirname(__file__), "checkpoints")

class EfficientNetModelBuilder:
    MODEL_META = {
        'B0': (efficientnet.EfficientNetB0, (224, 224)),
        'B1': (efficientnet.EfficientNetB1, (240, 240)),
        'B2': (efficientnet.EfficientNetB2, (260, 260)),
        'B3': (efficientnet.EfficientNetB3, (300, 300)),
        'B4': (efficientnet.EfficientNetB4, (380, 380)),
        'B5': (efficientnet.EfficientNetB5, (456, 456)),
        'B6': (efficientnet.EfficientNetB6, (528, 528)),
        'B7': (efficientnet.EfficientNetB7, (600, 600)),
    }

    def __init__(self, model_type = 'B0'):
        self.architecture, self.image_size = self.MODEL_META[model_type]

    def build(self, input_shape, data_augmentation, trainable=False, dropout=0.2):
        inputs = keras.Input(shape=input_shape)
        x = data_augmentation(inputs)
        x = efficientnet.preprocess_input(x)

        base_model = self.architecture(weights="imagenet", include_top=False, input_tensor=x)
        base_model.trainable = trainable

        head_model = base_model.output
        head_model = layers.GlobalAveragePooling2D()(head_model)
        head_model = layers.Dropout(dropout)(head_model)
        outputs = layers.Dense(1, activation="sigmoid")(head_model)
        model = Model(inputs, outputs)

        return model

ap = argparse.ArgumentParser()
ap.add_argument("-d", "--dataset", required=True, help="name of dataset")
ap.add_argument("-b", "--batch_size", default=32, type=int, help="batch size")
ap.add_argument("-e", "--epochs", default=10, type=int, help="number of epochs")
ap.add_argument("-v", "--validation_split", default=0.3, type=float, help="validation split")
ap.add_argument("-s", "--seed", default=168369, type=int, help="seed")
ap.add_argument("-mt", "--model_type", default="B0", type=str, help="efficient net model type (B0-B7)")

args = vars(ap.parse_args())

dataset_name = args["dataset"]
batch_size = args["batch_size"]
epochs = args["epochs"]
validation_split = args["validation_split"]
model_type = args["model_type"]
seed = args["seed"]

data_path = os.path.join(DATASETS_LOCATION, dataset_name)

LEARNING_RATE = 1e-3
AUTOTUNE = tf.data.AUTOTUNE

model_builder = EfficientNetModelBuilder(model_type)
image_size = model_builder.image_size

train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    data_path,
    validation_split=validation_split,
    subset="training",
    seed=seed,
    image_size=image_size,
    batch_size=batch_size,
    label_mode='binary'
)
val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    data_path,
    validation_split=validation_split,
    subset="validation",
    seed=seed,
    image_size=image_size,
    batch_size=batch_size,
    label_mode='binary'
)

data_augmentation = keras.Sequential(
    [
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomContrast(factor=0.1),
        layers.RandomTranslation(height_factor=0.1, width_factor=0.1),
    ],
    name="img_augmentation"
)

train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

model = model_builder.build(input_shape=image_size + (3,), data_augmentation=data_augmentation)

callbacks = [
    EarlyStopping(
        monitor='val_loss',
        patience=30, mode='min',
        min_delta=0.0001
    ),
    ModelCheckpoint(
        "%s/effnet-{epoch:02d}-{val_loss:.2f}.hdf5" % CHECKPOINTS_LOCATION,
        monitor='val_loss',
        mode='min',
        save_best_only=True
    )
]

model.compile(optimizer=keras.optimizers.Adam(LEARNING_RATE),
            loss=tf.keras.losses.BinaryCrossentropy(),
            metrics=keras.metrics.BinaryAccuracy())
model.summary()

model.fit(
    train_ds, epochs=epochs, callbacks=callbacks, validation_data=val_ds,
)

def resize_image(img_path, img_size):
    img = image.load_img(img_path, target_size = img_size)
    x = image.img_to_array(img)

    return np.array([x])

# model = load_model('modelname.hdf5')
test_images = ['testing/test.png', 'testing/test2.png', 'testing/test3.jpg', 'testing/test4.jpg']
for test_image in test_images:
    predictions = model.predict(resize_image(test_image, image_size))
    print(f'Predictions for test image {test_image}:')
    print(predictions)

pdb.set_trace()
