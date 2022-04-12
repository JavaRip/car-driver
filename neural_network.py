import pandas as pd
import sklearn as sk
from sklearn.neural_network import MLPClassifier

data_df_inputs = pd.read_csv('./clean_data.csv', usecols=['posX', 'posY', 'movVec', 'speed'])
data_df_outputs = pd.read_csv('./clean_data.csv', usecols=['turnLeft', 'turnRight', 'accel'])

inputs = data_df_inputs.to_numpy()
outputs = data_df_outputs.to_numpy()

clf = MLPClassifier(solver='lbfgs', alpha=1e-5,hidden_layer_sizes=(5, 3), random_state=1)
clf.fit(inputs, outputs)
meme = MLPClassifier(alpha=1e-05, hidden_layer_sizes=(5, 2), random_state=1,solver='lbfgs')

