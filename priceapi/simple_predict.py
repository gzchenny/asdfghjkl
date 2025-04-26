import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from sklearn.preprocessing import StandardScaler
import sys
import argparse
import os

class SuppressPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout

with SuppressPrints():
    class PricePredictor(nn.Module):
        def __init__(self, input_dim):
            super(PricePredictor, self).__init__()
            self.fc1 = nn.Linear(input_dim, 128)
            self.fc2 = nn.Linear(128, 64)
            self.fc3 = nn.Linear(64, 1)
            self.relu = nn.ReLU()

        def forward(self, x):
            x = self.relu(self.fc1(x))
            x = self.relu(self.fc2(x))
            x = self.fc3(x)
            return x

try:
    df_train = pd.read_csv('ProductPriceIndex_AUD_per_kg.csv')
except Exception:
    sys.exit(1)

def predict_from_string(data_string):
    values = data_string.strip().split(',')
    feature_cols = [col for col in df_train.columns if not ('price' in col.lower() or 'retail' in col.lower())]

    if len(values) > len(feature_cols):
        values = values[:len(feature_cols)]
    elif len(values) < len(feature_cols):
        values.extend(['0'] * (len(feature_cols) - len(values)))

    row_data = {}
    for i, col in enumerate(feature_cols):
        if i < len(values):
            val = values[i]
            if val.lower() in ('true', 'false', ''):
                row_data[col] = 1 if val.lower() == 'true' else 0
            else:
                try:
                    row_data[col] = float(val)
                except ValueError:
                    row_data[col] = 0
    
    sample = pd.DataFrame([row_data])

    for col in feature_cols:
        if col not in sample.columns:
            sample[col] = 0

    for col in sample.columns:
        if not pd.api.types.is_numeric_dtype(sample[col]):
            sample[col] = 0

    scaler = StandardScaler()
    X_train = df_train[feature_cols].replace({'True': 1, 'False': 0, True: 1, False: 0})
    X_train = X_train.infer_objects(copy=False).astype(float).values
    scaler.fit(X_train)

    sample_array = sample[feature_cols].values
    scaled_sample = scaler.transform(sample_array)

    input_dim = len(feature_cols)
    model = PricePredictor(input_dim)
    model.load_state_dict(torch.load('produce_price_model.pth'))
    model.eval()

    with torch.no_grad():
        X = torch.tensor(scaled_sample, dtype=torch.float32)
        prediction = model(X).item()

    return round(prediction, 2)

def predict_price(data_string: str) -> float:
    try:
        return predict_from_string(data_string)
    except Exception:
        return -1.0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('--data', type=str,
                        default="True,False,2025,4,25,False,False,False,False,False,False,True,False,False,False,False,False,False,False,False,False,False,False,False,False,False,False")
    args, _ = parser.parse_known_args()
    price = predict_price(args.data)
    print(price)