-- CreateTable
CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "branch_id" INTEGER NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "profile_risk_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_risks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "profile_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "ktp_url" TEXT,
    "npwp_url" TEXT,
    "payslip_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "houses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "room_count" INTEGER NOT NULL,
    "bathroom_count" INTEGER NOT NULL,
    "parking_count" INTEGER NOT NULL,
    "land_area" INTEGER NOT NULL,
    "building_area" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "is_sold" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "admin_id" TEXT NOT NULL,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tracking_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house_bookmarks" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "house_id" INTEGER NOT NULL,
    "tracking_status_id" INTEGER NOT NULL,

    CONSTRAINT "house_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_banking_users" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "occupation" TEXT NOT NULL,
    "annual_income" BIGINT NOT NULL,
    "monthly_inhand_salary" BIGINT NOT NULL,
    "num_bank_accounts" INTEGER NOT NULL,
    "num_credit_cards" INTEGER NOT NULL,
    "interest_rate" INTEGER NOT NULL,
    "num_of_loans" INTEGER NOT NULL,
    "type_of_loans" TEXT NOT NULL,
    "delay_from_due_date" INTEGER NOT NULL,
    "num_of_delayed_payments" INTEGER NOT NULL,
    "changed_credit_limit" INTEGER NOT NULL,
    "num_credit_inquiries" INTEGER NOT NULL,
    "credit_mix" TEXT NOT NULL,
    "outstanding_debt" INTEGER NOT NULL,
    "credit_history_age" INTEGER NOT NULL,
    "payment_of_minimum_amount" INTEGER NOT NULL,
    "total_emi_per_month" BIGINT NOT NULL,
    "payment_behaviour" TEXT NOT NULL,
    "monthly_balance" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_banking_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_risk_id_key" ON "users"("profile_risk_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_userId_key" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "houses_id_index" ON "houses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "core_banking_users_phone_number_key" ON "core_banking_users"("phone_number");

-- CreateIndex
CREATE INDEX "core_banking_user_phone_number_index" ON "core_banking_users"("phone_number");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_risk_id_fkey" FOREIGN KEY ("profile_risk_id") REFERENCES "profile_risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "houses" ADD CONSTRAINT "houses_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_bookmarks" ADD CONSTRAINT "house_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_bookmarks" ADD CONSTRAINT "house_bookmarks_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_bookmarks" ADD CONSTRAINT "house_bookmarks_tracking_status_id_fkey" FOREIGN KEY ("tracking_status_id") REFERENCES "tracking_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
