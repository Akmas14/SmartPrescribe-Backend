from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load your trained model
model = load_model('patient_rnn_model.keras')

# Define the input shape for validation
INPUT_SHAPE = (1, 8)  # Adjust based on your model's input shape

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Parse input JSON
        print("Request Data:", request.json)
        data = request.json
        if not data or 'inputs' not in data:
            return jsonify({"error": "Invalid input"}), 400

        # Convert input to NumPy array
        #inputs = np.array(data['inputs'], dtype=np.float32).reshape(INPUT_SHAPE)
        input_vectors = data['inputs']
        print("testttt")
        input_vectors = np.array(input_vectors).reshape((-1, 1, len(input_vectors[0])))

        print("Processed Inputs:", input_vectors)
        # Make predictions
        predictions = model.predict(input_vectors)
        results = []
        for i, pred in enumerate(predictions):
            medication_index = int(np.argmax(pred))
            confidence = float(np.max(pred))
            results.append({ 'suggested_medication': medication_index, 'confidence': confidence})
        print(results)
        predicted_class = int(np.argmax(predictions))
        print('test2')
        confidence = float(np.max(predictions))
        print(f"Predicted Class: {predicted_class}, Confidence: {confidence}")

        # Return predictions
        return results

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True)