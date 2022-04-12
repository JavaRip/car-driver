from flask import Flask, redirect, url_for, request, json
import logging
import pandas as pd
import numpy as np
import sklearn as sk
import math
from sklearn.neural_network import MLPClassifier

app = Flask(__name__)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

def get_model(training_data):
    # data_df_inputs = pd.read_csv('./clean_data.csv', usecols=['posX', 'posY', 'movVec', 'speed'])
    # data_df_outputs = pd.read_csv('./clean_data.csv', usecols=['turnLeft', 'turnRight', 'accel'])

    data_df_inputs = training_data[['posX', 'posY', 'movVec', 'speed']]
    data_df_outputs = training_data[['turnLeft', 'turnRight', 'accel']]

    inputs = data_df_inputs.to_numpy()
    outputs = data_df_outputs.to_numpy()

    clf = MLPClassifier(solver='lbfgs', alpha=1e-5,hidden_layer_sizes=(5, 3), random_state=1)
    clf.fit(inputs, outputs)
    return clf

def clean_data(data, train):
    data_df = data.copy()

    if train:
        data_df = data_df.loc[data_df['accel']==True]
        data_df['turnLeft'] = data_df['turnLeft'].apply(lambda x: 1 if x else 0 )
        data_df['turnRight'] = data_df['turnRight'].apply(lambda x: 1 if x else 0 )
        data_df['accel'] = data_df['accel'].apply(lambda x: 1 if x else 0 )

    data_df['posX'] = data_df['posX'] / 1000
    data_df['posY'] = data_df['posY'] / 1000

    data_df['movVec'] = data_df['movVec'].apply(lambda x: x if x > 0 else 0)

    data_df['movVec'] = data_df['movVec'] / math.tau
    data_df['speed'] = data_df['speed'] / 20

    return data_df

print('cleaning data')
source_data = pd.read_csv('./data.csv')
cleaned_data = clean_data(source_data, True)
print('preparing model')
model = get_model(cleaned_data)
print('model ready')

@app.route('/gamestate', methods = ['POST'])
def get_next_move():
  gamestate = request.get_json(force=True)['gamestate']
  gamestate_arr = gamestate.split(',')
  gamestate_np = np.array(gamestate_arr)
  gamestate_df = pd.DataFrame(data=[gamestate_arr], columns=['posX', 'posY', 'movVec', 'speed'], dtype='float32')
  cleaned_gamestate_arr = clean_data(gamestate_df, False)

  next_move = model.predict(cleaned_gamestate_arr)
  return str(next_move)

if __name__ == '__main__':
   app.run(debug = False)

