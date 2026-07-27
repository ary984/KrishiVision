import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

def check_or_create_dir():
    artifacts_dir = os.path.join(os.path.dirname(__file__), 'artifacts')
    if not os.path.exists(artifacts_dir):
        os.makedirs(artifacts_dir)

def train_model():
    print("Loading dataset...")
    # Adjust path assuming this script is run from inside ml-model or repo root
    # Since dataset is in D:\ANTIGRAVITY\BUILDHUB_HACKATHON\dataset\Smart_Farming_Crop_Yield_2024.csv
    dataset_path = r"D:\ANTIGRAVITY\BUILDHUB_HACKATHON\dataset\Smart_Farming_Crop_Yield_2024.csv"
    
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return

    df = pd.read_csv(dataset_path)
    # Drop rows where target is missing
    df = df.dropna(subset=['crop_disease_status'])

    # Features to use
    categorical_features = ['region', 'crop_type', 'irrigation_type', 'fertilizer_type']
    numeric_features = [
        'soil_moisture_%', 'soil_pH', 'temperature_C', 
        'rainfall_mm', 'humidity_%', 'sunlight_hours', 
        'pesticide_usage_ml', 'NDVI_index'
    ]

    print("Preprocessing data...")
    X = df[categorical_features + numeric_features]
    y = df['crop_disease_status']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Preprocessing pipelines
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # Append classifier to preprocessing pipeline
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))])

    print("Training Random Forest Classifier...")
    clf.fit(X_train, y_train)
    
    print(f"Training accuracy: {clf.score(X_train, y_train):.3f}")
    print(f"Test accuracy: {clf.score(X_test, y_test):.3f}")

    # Save the pipeline
    check_or_create_dir()
    model_path = os.path.join(os.path.dirname(__file__), 'artifacts', 'tabular_model.joblib')
    joblib.dump(clf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    train_model()
