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
  cleaned_data = clean_training_data(training_data)
  MODEL = get_model(cleaned_data)

  return json.dumps({'ok': True}), 200, {'ContentType': 'application/json'}

def clean_training_data(training_data):
  headers = [
    'turnLeft',
    'turnRight',
    'accel',
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
  return training_data_df.astype('int')

def get_model(training_data):
    training_data.info()
    features = training_data[['sen1', 'sen2', 'sen3', 'sen4', 'sen5', 'sen6', 'sen7', 'sen8']]
    labels = training_data[['turnLeft', 'turnRight', 'accel']]

    clf = MLPClassifier(
      solver='lbfgs',
      alpha=1e-8,
      hidden_layer_sizes=(8, 3),
      random_state=1,
      max_iter=500,
    )

    clf.fit(features, labels)
    return clf

@app.route('/getMove', methods=['POST'])
def get_next_move():
  gamestate = request.get_json(force=True)
  sensors = list(map(lambda x: x['length'], gamestate))
  gamestate_df = pd.DataFrame(
    data=[sensors],
    columns=[
      'sen1',
      'sen2',
      'sen3',
      'sen4',
      'sen5',
      'sen6',
      'sen7',
      'sen8'
    ],
    dtype='float32'
  )

  cleaned_gamestate_df = clean_data(gamestate_df, False)

  next_move = model.predict(cleaned_gamestate_df)[0]
  return json.dumps(next_move.tolist())

if __name__ == "__main__":
  app.run(debug=False)
