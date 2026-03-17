# UPI Payment Gateway Simulator - PayCore

A comprehensive UPI Payment Gateway Simulator with Payment Initiation Module implementing Strategy Pattern and Open-Closed Principle.

## 🏗️ Architecture

### Strategy Pattern Implementation
- **PaymentProcessor Interface**: Common interface for all payment processors
- **UPIProcessor**: Handles UPI payments (90% success rate, 2s processing)
- **CardProcessor**: Handles card payments (85% success rate, 4s processing)  
- **NetBankingProcessor**: Handles net banking (80% success rate, 6s processing)
- **PaymentProcessorFactory**: Dynamically selects appropriate processor

### Open-Closed Principle
- New payment methods can be added without modifying existing code
- Simply implement PaymentProcessor interface and register in factory

## 🚀 Quick Start

```bash
# Setup and run all services
./run.sh setup  # First time setup
./run.sh run    # Start all services (default)
```

## 📋 Services

- **Frontend**: http://localhost:5173 (React + Tailwind CSS)
- **Payment Initiation**: http://localhost:5173/merchant/1/payment-initiation
- **Payment Service**: http://localhost:3001 (Node.js + Supabase)
- **Backend**: http://localhost:8081 (Spring Boot + H2)

## 🔧 API Endpoints

- `POST /api/payment/initiate` - Initiate payment
- `GET /api/payment/status/:id` - Get transaction status
- `GET /api/payment/merchant/:id/transactions` - Get merchant transactions
- `GET /api/payment/methods` - Get available payment methods

## 🎯 Features

- ✅ Strategy Pattern for payment processing
- ✅ Real-time transaction status updates
- ✅ Professional fintech UI with status badges
- ✅ Transaction lifecycle visualization
- ✅ Toast notifications
- ✅ Loading states and error handling
- ✅ Responsive design

## 🗄️ Database Schema

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('CREATED', 'INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED')),
    payment_method VARCHAR(50) NOT NULL,
    merchant_transaction_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    failure_reason TEXT,
    upi_transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Spring Boot, Java 17, H2 Database
- **Payment Service**: Node.js, Express, Supabase
- **Architecture**: Strategy Pattern, Factory Pattern, OCP Compliance

## 📁 Project Structure

```
├── frontend/                 # React frontend application
├── backend/                  # Spring Boot backend
├── payment-service/          # Node.js payment service with Supabase
│   ├── strategies/          # Payment processor implementations
│   ├── factory/             # Payment processor factory
│   └── services/            # Business logic services
├── docs/                    # Documentation and specifications
├── uml/                     # UML diagrams
└── run.sh                   # Single script to setup and run all services
```

## 🎓 Academic Purpose

This project demonstrates:
- Object-Oriented Analysis and Design
- Strategy Pattern implementation
- Open-Closed Principle compliance
- Factory Pattern usage
- Real-time system design
- Professional UI/UX for fintech applications