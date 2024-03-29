import json
from flask import Flask, render_template, request, send_from_directory
import logging
import pandas as pd
import numpy as np
import sklearn as sk
import math
from sklearn.neural_network import MLPClassifier

app = Flask(__name__, static_url_path='', static_folder='static')

@app.route("/")
def home():
  return send_from_directory(app.static_folder, 'index.html')


def get_model(training_data):
    data_df_inputs = training_data[['sen1', 'sen2', 'sen3', 'sen4', 'sen5', 'sen6', 'sen7', 'sen8']]
    data_df_outputs = training_data[['turnLeft', 'turnRight', 'accel']]

    clf = MLPClassifier(
      solver='lbfgs',
      alpha=1e-8,
      hidden_layer_sizes=(8, 3),
      random_state=1,
      max_iter=500,
    )

    clf.fit(data_df_inputs, data_df_outputs)
    return clf

def clean_data(data, train):
  data_df = data.copy()

  if train:
    data_df = data_df.loc[data_df['accel']==True]
    data_df['turnLeft'] = data_df['turnLeft'].apply(lambda x: 1 if x else 0 )
    data_df['turnRight'] = data_df['turnRight'].apply(lambda x: 1 if x else 0 )
    data_df['accel'] = data_df['accel'].apply(lambda x: 1 if x else 0 )

  data_df['sen1'] = data_df['sen1'].astype(float) / 1000
  data_df['sen2'] = data_df['sen2'].astype(float) / 1000
  data_df['sen3'] = data_df['sen3'].astype(float) / 1000
  data_df['sen4'] = data_df['sen4'].astype(float) / 1000
  data_df['sen5'] = data_df['sen5'].astype(float) / 1000
  data_df['sen6'] = data_df['sen6'].astype(float) / 1000
  data_df['sen7'] = data_df['sen7'].astype(float) / 1000
  data_df['sen8'] = data_df['sen8'].astype(float) / 1000

  return data_df

print('cleaning data')
source_data = pd.read_csv('./data.csv')
cleaned_data = clean_data(source_data, True)
print('preparing model')
model = get_model(cleaned_data)
print('model ready')

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
