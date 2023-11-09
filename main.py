import json
from flask import Flask, render_template, request, send_from_directory
import logging
import pandas as pd
import numpy as np
import sklearn as sk
import math
from sklearn.neural_network import MLPClassifier

app = Flask(__name__, static_url_path='', static_folder='static')
MODEL = None

@app.route("/")
def home():
  return send_from_directory(app.static_folder, 'index.html')

@app.route("/train_model", methods=['POST'])
def train_model():
  training_data = request.get_json()
  headers = [
    'turnLeft',
    'accel',
    'turnRight',
    'sen1',
    'sen2',
    'sen3',
    'sen4',
    'sen5',
    'sen6',
    'sen7',
    'sen8',
  ]
  training_data_df = pd.DataFrame(training_data, columns=headers)
  training_data_df.astype('int')
  global MODEL
  MODEL = get_model(training_data_df)

  return json.dumps({'ok': True}), 200, {'ContentType': 'application/json'}

def get_model(training_data):
    training_data.info()
    print(training_data.head(100))
    features = training_data[['sen1', 'sen2', 'sen3', 'sen4', 'sen5', 'sen6', 'sen7', 'sen8']]
    labels = training_data[['turnLeft', 'accel', 'turnRight']]

    print('======== features =======')
    print(features)
    print('======== labels =======')
    print(labels)

    clf = MLPClassifier(
      solver='lbfgs',
      # alpha=1e-8,
      hidden_layer_sizes=(20, 3),
      random_state=1,
      max_iter=500,
    )

    clf.fit(features, labels)
    return clf

@app.route('/get_move', methods=['POST'])
def get_next_move():
  gamestate = request.get_json(force=True)

  if len(gamestate[0]) != 8:
    print('invalid gamestate')
    return json.dumps([0, 0, 0])

  headers = [
    'sen1',
    'sen2',
    'sen3',
    'sen4',
    'sen5',
    'sen6',
    'sen7',
    'sen8',
  ]

  gamestate_df = pd.DataFrame(gamestate, columns=headers)

  next_move = MODEL.predict(gamestate_df)[0]
  return json.dumps(next_move.tolist())

if __name__ == "__main__":
  app.run(debug=False)
