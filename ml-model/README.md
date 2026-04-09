# ML Model — Setup Guide

## Step 1 — Download Dataset from Kaggle
Go to: https://kaggle.com/datasets/itachi9604/disease-symptom-description-dataset
Download and place these files in this folder:
- dataset.csv
- symptom_Description.csv
- symptom_precaution.csv

## Step 2 — Install Python dependencies
pip install -r requirements.txt

## Step 3 — Train the model
python train.py

You will see:
Model Accuracy: ~97%
Model saved as model.pkl

## Step 4 — Start Flask API
python app.py

Runs on: http://localhost:5001

## Step 5 — Start your MERN app
The Express backend will automatically detect and use the ML model!

## Priority order:
1. ML Model (if running) ← most accurate
2. Dataset matching (fallback)
3. Gemini AI (if no dataset match)
