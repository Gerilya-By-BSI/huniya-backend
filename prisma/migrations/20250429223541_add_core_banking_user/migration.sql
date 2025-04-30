-- CreateTable
CREATE TABLE "CoreBankingUser" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "occupation" TEXT NOT NULL,
    "annual_income" INTEGER NOT NULL,
    "monthly_inhand_salary" INTEGER NOT NULL,
    "interest_rate" INTEGER NOT NULL,
    "num_of_loans" INTEGER NOT NULL,
    "type_of_loans" TEXT NOT NULL,
    "delay_from_due_date" INTEGER NOT NULL,
    "num_of_delayed_payments" INTEGER NOT NULL,
    "changed_credit_limit" INTEGER NOT NULL,
    "num_credit_inquiries" INTEGER NOT NULL,
    "credit_mix" TEXT NOT NULL,
    "outstanding_debt" INTEGER NOT NULL,
    "credit_utilization_ratio" INTEGER NOT NULL,
    "credit_history_age" INTEGER NOT NULL,
    "payment_of_minimum_amount" INTEGER NOT NULL,
    "total_emi_per_month" INTEGER NOT NULL,
    "amount_invested_monthly" INTEGER NOT NULL,
    "payment_behaviour" TEXT NOT NULL,
    "monthly_balance" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreBankingUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoreBankingUser_phone_number_key" ON "CoreBankingUser"("phone_number");

-- CreateIndex
CREATE INDEX "core_banking_user_phone_number_index" ON "CoreBankingUser"("phone_number");
