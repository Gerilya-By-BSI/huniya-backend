
# Credit Score Prediction API with FastAPI

A modern, high-performance API for credit score prediction built with FastAPI.

## Features

- Fast API responses with automatic data validation
- Interactive API documentation
- CORS enabled for cross-origin requests
- Robust error handling

## Setup

1. Install dependencies:

   ```
   pip install -r requirements.txt
   ```
2. Make sure you have the following model files in the same directory:

   - `model_xgb_creditscore.pkl`
   - `encoders_creditscore.pkl`
   - `scaler_creditscore.pkl`
3. Run the application:

   ```
   uvicorn main:app --reload
   ```

The API will be available at http://localhost:8000

## API Documentation

FastAPI provides automatic interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Predict Credit Score

**URL**: `/api/predict`

**Method**: `POST`

**Request Body Example**:

```json
{
    "Age": 30,
    "Occupation": "Engineer",
    "Annual_Income": 8000,
    "Monthly_Inhand_Salary": 1000,
    "Interest_Rate": 10,
    "Num_of_Loan": 2,
    "Type_of_Loan": "Mortgage Loan",
    "Delay_from_due_date": 5,
    "Num_of_Delayed_Payment": 1,
    "Changed_Credit_Limit": 15,
    "Num_Credit_Inquiries": 100,
    "Credit_Mix": 1,
    "Outstanding_Debt": 1000,
    "Credit_Utilization_Ratio": 30,
    "Credit_History_Age": 60,
    "Payment_of_Min_Amount": 1,
    "Total_EMI_per_month": 200,
    "Amount_invested_monthly": 150,
    "Payment_Behaviour": 1,
    "Monthly_Balance": 0
}
```

**Response**:

```json
{
    "status": "success",
    "prediction": "Good"
}
```

### Health Check

**URL**: `/health`

**Method**: `GET`

**Response**:

```json
{
    "status": "healthy"
}
```
