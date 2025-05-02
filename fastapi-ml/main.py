from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import pandas as pd
import pickle
import os
import uvicorn
import logging

app = FastAPI(
    title="Credit Score Prediction API",
    description="API for predicting credit scores based on customer data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

try:
    model_path = os.path.join(os.path.dirname(__file__), './models/model_xgb_creditscore.pkl')
    encoders_path = os.path.join(os.path.dirname(__file__), './models/encoders_creditscore.pkl')
    scaler_path = os.path.join(os.path.dirname(__file__), './models/scaler_creditscore.pkl')

    model = pickle.load(open(model_path, 'rb'))
    encoders = pickle.load(open(encoders_path, 'rb'))
    scaler = pickle.load(open(scaler_path, 'rb'))
except Exception as e:
    print(f"Error loading models: {e}")
    raise

# Input model validation
class CreditScoreInput(BaseModel):
    Age: int = Field(..., description="Age of the customer in years")
    Occupation: str = Field(..., description="Occupation of the customer")
    Annual_Income: float = Field(..., description="Annual income")
    Monthly_Inhand_Salary: float = Field(..., description="Monthly in-hand salary")
    Num_Bank_Accounts: int = Field(..., description="Number of bank accounts")
    Num_Credit_Card: int = Field(..., description="Number of credit cards")
    Interest_Rate: float = Field(..., description="Interest rate")
    Num_of_Loan: int = Field(..., description="Number of loans")
    Type_of_Loan: str = Field(..., description="Type of loan")
    Delay_from_due_date: int = Field(..., description="Delay from due date in days")
    Num_of_Delayed_Payment: int = Field(..., description="Number of delayed payments")
    Changed_Credit_Limit: float = Field(..., description="Changes in credit limit")
    Num_Credit_Inquiries: int = Field(..., description="Number of credit inquiries")
    Credit_Mix: int = Field(..., description="Credit mix (0 for Good, 1 for Standard, 2 for Bad)")
    Outstanding_Debt: float = Field(..., description="Outstanding debt")
    Credit_History_Age: int = Field(..., description="Credit history age in months")
    Payment_of_Min_Amount: int = Field(..., description="Payment of minimum amount (1 for Yes, 0 for No)")
    Total_EMI_per_month: float = Field(..., description="Total EMI per month")
    Payment_Behaviour: int = Field(..., description="Payment behavior")
    Monthly_Balance: float = Field(..., description="Monthly balance")

    class Config:
        schema_extra = {
            "example": {
                "Age": 30,
                "Occupation": "Engineer",
                "Annual_Income": 8000,
                "Monthly_Inhand_Salary": 1000,
                "Num_Bank_Accounts": 2,
                "Num_Credit_Card": 1,
                "Interest_Rate": 10,
                "Num_of_Loan": 2,
                "Type_of_Loan": "Mortgage Loan",
                "Delay_from_due_date": 5,
                "Num_of_Delayed_Payment": 1,
                "Changed_Credit_Limit": 15,
                "Num_Credit_Inquiries": 100,
                "Credit_Mix": 1,
                "Outstanding_Debt": 1000,
                "Credit_History_Age": 60,
                "Payment_of_Min_Amount": 1,
                "Total_EMI_per_month": 200,
                "Payment_Behaviour": 1,
                "Monthly_Balance": 0
            }
        }

# Response model
class PredictionResponse(BaseModel):
    status: str
    prediction: str

# Health check response model
class HealthResponse(BaseModel):
    status: str

# Encode Occupation and Type of Loan
def validate_and_encode(dummy_df, encoders_dict):
    dummy_encoded = dummy_df.copy()
    for col in ['Occupation', 'Type_of_Loan']:
        if col in dummy_encoded.columns:
            valid_classes = list(encoders_dict[col].classes_)
            dummy_encoded[col] = dummy_encoded[col].apply(
                lambda x: encoders_dict[col].transform([x])[0] if x in valid_classes else 0
            )
    return dummy_encoded

@app.post("/api/predict/profile-risk", response_model=PredictionResponse, tags=["prediction"])
async def predict_score(input_data: CreditScoreInput):
    try:
        # Convert input to dataframe
        input_df = pd.DataFrame([input_data.dict()])
        
        # Process the data
        df_encoded = validate_and_encode(input_df, encoders)
        df_scaled = scaler.transform(df_encoded)
        
        # Make prediction
        prediction = model.predict(df_scaled)
        credit_score = encoders['Credit_Score'].inverse_transform([prediction[0]])[0]
        
        # Return prediction
        return {
            "status": "success",
            "prediction": credit_score
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    logger.info("Starting FastAPI ML service on port 5000")
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)