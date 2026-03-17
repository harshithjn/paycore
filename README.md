# UPI Payment Gateway Simulator - PayCore

A comprehensive UPI Payment Gateway Simulator with Payment Initiation and Verification Modules implementing Strategy Pattern and Open-Closed Principle.

## 🏗️ Architecture

### Strategy Pattern Implementation
**Payment Processing:**
- **PaymentProcessor Interface**: Common interface for all payment processors
- **UPIProcessor**: Handles UPI payments (90% success rate, 2s processing)
- **CardProcessor**: Handles card payments (85% success rate, 4s processing)  
- **NetBankingProcessor**: Handles net banking (80% success rate, 6s processing)
- **PaymentProcessorFactory**: Dynamically selects appropriate processor

**Verification System:**
- **VerificationStrategy Interface**: Common interface for all verification strategies
- **UPIVerification**: UPI transaction verification (95% success rate)
- **CardVerification**: Card transaction verification (88% success rate)
- **NetBankingVerification**: NetBanking verification (82% success rate)
- **VerificationFactory**: Dynamically selects verification strategy

### Open-Closed Principle
- New payment methods can be added without modifying existing code
- New verification strategies can be added without changing core logic
- State transitions are configurable and extensible

### State Management
- **TransactionStateManager**: Manages valid state transitions
- **States**: CREATED → INITIATED → PROCESSING → SUCCESS/FAILED → REFUNDED → SETTLED
- **Audit Trail**: Complete logging of state transitions and verification attempts

## 🚀 Quick Start

```bash
# Setup and run all services
./run.sh setup  # First time setup
./run.sh run    # Start all services (default)
```

## 📋 Services

- **Frontend**: http://localhost:5173 (React + Tailwind CSS)
- **Payment Initiation**: http://localhost:5173/merchant/1/payment-initiation
- **Transaction Verification**: http://localhost:5173/merchant/1/verification
- **Payment Service**: http://localhost:3001 (Node.js + Supabase)
- **Backend**: http://localhost:8081 (Spring Boot + H2)

## 🔧 API Endpoints

**Payment APIs:**
- `POST /api/payment/initiate` - Initiate payment
- `GET /api/payment/status/:id` - Get transaction status
- `GET /api/payment/merchant/:id/transactions` - Get merchant transactions
- `GET /api/payment/methods` - Get available payment methods

**Verification APIs:**
- `GET /api/verification/status?id=txn_id` - Get detailed transaction status
- `POST /api/verification/verify` - Verify transaction with provider
- `GET /api/verification/merchant/:id/transactions` - Get transactions with filters

## 🎯 Features

### Payment Initiation Module
- ✅ Strategy Pattern for payment processing
- ✅ Real-time transaction status updates
- ✅ Professional fintech UI with status badges
- ✅ Transaction lifecycle visualization
- ✅ Toast notifications and error handling

### Payment Verification Module
- ✅ State-driven transaction lifecycle management
- ✅ Extensible verification strategies
- ✅ Transaction timeline with state transitions
- ✅ Callback logging and audit trail
- ✅ Auto-refresh and real-time monitoring
- ✅ Advanced filtering and search
- ✅ Detailed transaction drawer with verification attempts

## 🗄️ Database Schema

```sql
-- Core transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('CREATED', 'INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'SETTLED')),
    payment_method VARCHAR(50) NOT NULL,
    merchant_transaction_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    failure_reason TEXT,
    upi_transaction_id VARCHAR(255),
    callback_url TEXT,
    callback_sent BOOLEAN DEFAULT FALSE,
    verification_attempts INTEGER DEFAULT 0,
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Callback logs for audit trail
CREATE TABLE callback_logs (
    id UUID PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    status_sent VARCHAR(20) NOT NULL,
    callback_url TEXT,
    response_code INTEGER,
    response_body TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0
);

-- State transition logs
CREATE TABLE state_transitions (
    id UUID PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    transition_reason TEXT,
    transitioned_at TIMESTAMP DEFAULT NOW()
);

-- Verification attempts
CREATE TABLE verification_attempts (
    id UUID PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    verification_data JSONB,
    verified_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Spring Boot, Java 17, H2 Database
- **Payment Service**: Node.js, Express, Supabase
- **Architecture**: Strategy Pattern, Factory Pattern, State Management, OCP Compliance

## 📁 Project Structure

```
├── frontend/                 # React frontend application
├── backend/                  # Spring Boot backend
├── payment-service/          # Node.js payment service with Supabase
│   ├── strategies/          # Payment processor implementations
│   ├── verification/        # Verification strategy implementations
│   ├── state/               # State management system
│   ├── factory/             # Factories for strategy selection
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
- State-driven architecture
- Real-time system design
- Professional UI/UX for fintech applications
- Comprehensive audit logging and monitoring