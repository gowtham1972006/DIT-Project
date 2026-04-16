from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import os

app = Flask(__name__)
CORS(app)

print("Loading model... This may take a moment.")
# We load the distilroberta emotion classification model
classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", return_all_scores=False)
print("Model loaded successfully!")

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400

    message = data['message']
    
    # Analyze the emotion
    results = classifier(message)
    # results format: [{'label': 'emotion', 'score': 0.99}]
    
    if results and len(results) > 0:
        label = results[0]['label']
        score = results[0]['score']
        return jsonify({"label": label, "score": score})
    
    return jsonify({"error": "Failed to analyze"}), 500

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(host='127.0.0.1', port=5000)
