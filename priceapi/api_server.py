import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from simple_predict import predict_price
import os
import torch


app = Flask(__name__)
CORS(app)

# 27 field names, in correct order
FIELDS = [
    'is_in_season', 'natural_disruption', 'year', 'month', 'day',
    'productname_Asparagus', 'productname_Avocados', 'productname_Broccoli Bunches',
    'productname_Broccoli Crowns', 'productname_Cantaloupe', 'productname_Carrots',
    'productname_Cauliflower', 'productname_Celery', 'productname_Flame Grapes',
    'productname_Green Leaf Lettuce', 'productname_Honeydews', 'productname_Iceberg Lettuce',
    'productname_Nectarines', 'productname_Oranges', 'productname_Peaches',
    'productname_Plums', 'productname_Potatoes', 'productname_Red Leaf Lettuce',
    'productname_Romaine Lettuce', 'productname_Strawberries', 'productname_Thompson Grapes',
    'productname_Tomatoes'
]

def format_input(selected_product: str) -> str:
    today = datetime.date.today()

    values = []
    values.append('True')  # is_in_season
    values.append('False')  # natural_disruption
    values.append(str(today.year))  # year
    values.append(str(today.month))  # month
    values.append(str(today.day))  # day

    product_fields = FIELDS[5:]

    selected_product_lower = selected_product.lower().strip()

    for field in product_fields:
        product_name = field.replace('productname_', '').lower()
        if product_name == selected_product_lower:
            values.append('True')
        else:
            values.append('False')

    return ','.join(values)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    if not data or 'features' not in data:
        return jsonify({'error': 'Missing features field'}), 400

    features = data['features']

    formatted_string = format_input(features)

    prediction = predict_price(formatted_string)

    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)