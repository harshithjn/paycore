#!/bin/bash

echo "🚀 UPI Payment Gateway Simulator - Payment Initiation Module"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Function to kill background processes on exit
cleanup() {
    print_status "Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Setup function
setup() {
    print_header "Setting up dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    # Check if Java is installed
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 17+ first."
        exit 1
    fi

    # Check if Maven is installed
    if ! command -v mvn &> /dev/null; then
        print_error "Maven is not installed. Please install Maven first."
        exit 1
    fi

    print_status "Installing Node.js Payment Service dependencies..."
    cd payment-service
    npm install
    cd ..

    print_status "Installing Frontend dependencies..."
    cd frontend
    npm install
    cd ..

    print_status "Building Spring Boot Backend..."
    cd backend
    ./mvnw clean compile
    cd ..

    print_status "Creating environment file for payment service..."
    if [ ! -f payment-service/.env ]; then
        cp payment-service/.env.example payment-service/.env
        print_warning "Please update payment-service/.env with your Supabase credentials"
    fi

    print_status "Setup completed successfully!"
}

# Run function
run() {
    print_header "Starting all services..."

    print_status "Starting Spring Boot Backend on port 8081..."
    cd backend
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
    cd ..

    print_status "Starting Node.js Payment Service on port 3001..."
    cd payment-service
    npm start &
    PAYMENT_SERVICE_PID=$!
    cd ..

    print_status "Starting React Frontend on port 5173..."
    cd frontend
    npm run dev:no-check &
    FRONTEND_PID=$!
    cd ..

    print_status "All services started!"
    echo ""
    echo "📋 Service URLs:"
    echo "- Frontend: http://localhost:5173"
    echo "- Payment Initiation: http://localhost:5173/merchant/1/payment-initiation"
    echo "- Payment Service API: http://localhost:3001"
    echo "- Spring Boot Backend: http://localhost:8081"
    echo "- H2 Database Console: http://localhost:8081/h2-console"
    echo ""
    echo "🔧 API Endpoints:"
    echo "- POST /api/payment/initiate"
    echo "- GET  /api/payment/status/:transactionId"
    echo "- GET  /api/payment/merchant/:merchantId/transactions"
    echo "- GET  /api/payment/methods"
    echo ""
    echo "🏗️  Architecture Features:"
    echo "- ✅ Strategy Pattern implementation (UPI, Card, NetBanking processors)"
    echo "- ✅ Open-Closed Principle compliance"
    echo "- ✅ Factory Pattern for processor selection"
    echo "- ✅ Real-time transaction status updates"
    echo "- ✅ Professional fintech UI with status badges"
    echo "- ✅ Transaction lifecycle visualization"
    echo ""
    print_warning "Press Ctrl+C to stop all services"

    # Wait for all background processes
    wait
}

# Main script logic
case "${1:-run}" in
    "setup")
        setup
        ;;
    "run")
        run
        ;;
    *)
        echo "Usage: $0 [setup|run]"
        echo "  setup - Install dependencies and setup environment"
        echo "  run   - Start all services (default)"
        exit 1
        ;;
esac