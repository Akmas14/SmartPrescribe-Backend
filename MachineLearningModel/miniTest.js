import * as tf from '@tensorflow/tfjs-node';
import path from 'path';

async function testMinimalModel() {
    try {
        const modelPath = path.resolve('./minimal_model_js/model.json');
        console.log("Loading model from:", modelPath);

        const model = await tf.loadLayersModel(`file://${modelPath}`);
        console.log("Model loaded successfully.");
        console.log("Model Summary:", model.summary());

        // Create a dummy input tensor
        const inputTensor = tf.tensor([[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]]);
        console.log("Input Tensor Shape:", inputTensor.shape);

        // Make predictions
        const predictions = model.predict(inputTensor);
        predictions.print();
    } catch (error) {
        console.error("Error during testing:", error);
    }
}

testMinimalModel();
