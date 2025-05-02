import httpx
import asyncio
from pprint import pprint

async def test_predict_endpoint():
    async with httpx.AsyncClient(base_url="http://localhost:5000") as client:
        # Test with a good credit profile
        good_payload = {
            "Age": 40,
            "Occupation": "Engineer",
            "Annual_Income": 80000,
            "Monthly_Inhand_Salary": 6000,
            "Num_Bank_Accounts": 2,
            "Num_Credit_Card": 1,
            "Interest_Rate": 5,
            "Num_of_Loan": 1,
            "Type_of_Loan": "Mortgage Loan",
            "Delay_from_due_date": 0,
            "Num_of_Delayed_Payment": 0,
            "Changed_Credit_Limit": 10,
            "Num_Credit_Inquiries": 1,
            "Credit_Mix": 0,
            "Outstanding_Debt": 2000,
            "Credit_History_Age": 120,
            "Payment_of_Min_Amount": 1,
            "Total_EMI_per_month": 300,
            "Payment_Behaviour": 0,
            "Monthly_Balance": 5000
        }
        
        response = await client.post("/api/predict", json=good_payload)
        print("Status Code:", response.status_code)
        pprint(response.json())
        
        # Test with a bad credit profile
        bad_payload = {
            "Age": 21,
            "Occupation": "Student",
            "Annual_Income": 5000,
            "Monthly_Inhand_Salary": 100,
            "Num_Bank_Accounts": 0,
            "Num_Credit_Card": 0,
            "Interest_Rate": 20,
            "Num_of_Loan": 700,
            "Type_of_Loan": "Credit-Builder Loan",
            "Delay_from_due_date": 100,
            "Num_of_Delayed_Payment": 12,
            "Changed_Credit_Limit": -5,
            "Num_Credit_Inquiries": 10,
            "Credit_Mix": 2,
            "Outstanding_Debt": 4000,
            "Credit_History_Age": 6,
            "Payment_of_Min_Amount": 0,
            "Total_EMI_per_month": 60,
            "Payment_Behaviour": 2,
            "Monthly_Balance": 10
        }
        
        response = await client.post("/api/predict", json=bad_payload)
        print("\nStatus Code:", response.status_code)
        pprint(response.json())
        
        # Test with a standard/average credit profile
        standard_payload = {
            "Age": 35,
            "Occupation": "Teacher",
            "Annual_Income": 45000,
            "Monthly_Inhand_Salary": 3000,
            "Num_Bank_Accounts": 1,
            "Num_Credit_Card": 1,
            "Interest_Rate": 12,
            "Num_of_Loan": 3,
            "Type_of_Loan": "Personal Loan",
            "Delay_from_due_date": 15,
            "Num_of_Delayed_Payment": 3,
            "Changed_Credit_Limit": 5,
            "Num_Credit_Inquiries": 4,
            "Credit_Mix": 1,
            "Outstanding_Debt": 3000,
            "Credit_History_Age": 48,
            "Payment_of_Min_Amount": 1,
            "Total_EMI_per_month": 450,
            "Payment_Behaviour": 1,
            "Monthly_Balance": 600
        }

        response = await client.post("/api/predict", json=standard_payload)
        print("\nStandard Profile Status Code:", response.status_code)
        pprint(response.json())

        # Test health endpoint
        health_response = await client.get("/health")
        print("\nHealth Check Status Code:", health_response.status_code)
        pprint(health_response.json())

if __name__ == "__main__":
    asyncio.run(test_predict_endpoint())