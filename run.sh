#!/bin/bash

# ==========================================
#   _____             ____               
#  |  __ \           / ___|              
#  | |__) |_ _ _   _| |     ___  _ __ ___ 
#  |  ___/ _` | | | | |    / _ \| '__/ _ \
#  | |  | (_| | |_| | |___| (_) | | |  __/
#  |_|   \__,_|\__, |\____|\___/|_|  \___|
#               __/ |                     
#              |___/                      
# ==========================================

# Console Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    print_info "Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM EXIT

check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$2 is not installed. Please install it first."
        exit 1
    fi
}

setup_service() {
    local dir=$1
    local name=$2
    if [ -d "$dir" ]; then
        print_info "Installing $name dependencies..."
        (cd "$dir" && npm install)
    fi
}

setup() {
    print_info "Setting up environment and dependencies..."

    check_dependency "node" "Node.js"
    check_dependency "java" "Java 17+"
    check_dependency "mvn" "Maven"

    setup_service "payment-service" "Payment Service"
    setup_service "frontend" "Frontend UI"

    print_info "Building Spring Boot Backend..."
    (cd backend && ./mvnw clean compile)

    if [ -d "payment-service" ] && [ ! -f "payment-service/.env" ]; then
        if [ -f "payment-service/.env.example" ]; then
            cp "payment-service/.env.example" "payment-service/.env"
            print_warning "Please update payment-service/.env with your credentials."
        fi
    fi

    print_success "Setup completed successfully."
}

run() {
    print_info "Starting all services..."

    print_info "Starting Spring Boot Backend (Port 8081)..."
    (cd backend && ./mvnw spring-boot:run) &

    if [ -d "payment-service" ]; then
        print_info "Starting Node.js Payment Service (Port 3001)..."
        (cd payment-service && npm start) &
    fi

    print_info "Starting React Frontend (Port 5173)..."
    (cd frontend && npm run dev) &

    sleep 2
    echo ""
    print_success "Services have been initiated."
    echo ""
    echo "=============================="
    echo "       Service URLs           "
    echo "=============================="
    echo "Frontend:             http://localhost:5173"
    echo "Backend API:          http://localhost:8081"
    echo "H2 Database Console:  http://localhost:8081/h2-console"
    if [ -d "payment-service" ]; then
        echo "Payment Service API:  http://localhost:3001"
    fi
    echo "=============================="
    echo ""
    print_warning "Press Ctrl+C to terminate all processes."

    wait
}

case "${1:-run}" in
    "setup")
        setup
        ;;
    "run")
        run
        ;;
    *)
        echo "Usage: $0 [setup|run]"
        echo "  setup - Install dependencies and compile project"
        echo "  run   - Start all services (default)"
        exit 1
        ;;
esac