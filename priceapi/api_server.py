import datetime
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from simple_predict import predict_price
import os

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}})

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
    selected_product_clean = selected_product.strip().lower()

    matched_index = None
    for i, field in enumerate(product_fields):
        product_name_clean = field.replace('productname_', '').lower()
        if product_name_clean == selected_product_clean:
            matched_index = i
            break

    if matched_index is None:
        matched_index = random.randint(0, len(product_fields) - 1)

    for i in range(len(product_fields)):
        values.append('True' if i == matched_index else 'False')

    return ','.join(values)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    if not data or 'features' not in data:
        return jsonify({'error': 'Missing features field'}), 400

    features = data['features']
    
    # Normalize product name to match one of our supported products
    product_fields = FIELDS[5:]
    product_name_clean = features.strip().lower()
    
    matched_product = None
    for field in product_fields:
        product_name = field.replace('productname_', '').lower()
        if product_name in product_name_clean or product_name_clean in product_name:
            matched_product = field.replace('productname_', '')
            break
    
    # If no match found, use "Tomatoes" as default
    if not matched_product:
        matched_product = "Tomatoes"

    formatted_string = format_input(matched_product)
    prediction = predict_price(formatted_string)

    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)