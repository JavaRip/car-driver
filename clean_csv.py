import pandas as pd
import math

data_df = pd.read_csv('./data.csv')

data_df = data_df.loc[data_df['accel']==True]
data_df['posX'] = data_df['posX'] / 1000
data_df['posY'] = data_df['posY'] / 1000

data_df['movVec'] = data_df['movVec'].apply(lambda x: x if x > 0 else 0)

data_df['movVec'] = data_df['movVec'] / math.tau
data_df['speed'] = data_df['speed'] / 20
data_df['turnLeft'] = data_df['turnLeft'].apply(lambda x: 1 if x else 0 )
data_df['turnRight'] = data_df['turnRight'].apply(lambda x: 1 if x else 0 )
data_df['accel'] = data_df['accel'].apply(lambda x: 1 if x else 0 )

data_df.to_csv('./clean_data.csv', index=False)
