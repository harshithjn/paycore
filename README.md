# PayCore - Payment Gateway Simulator

```text
 /$$$$$$$                       /$$$$$$                               
| $$__  $$                     /$$__  $$                              
| $$  \ $$ /$$$$$$  /$$   /$$| $$  \__/  /$$$$$$   /$$$$$$   /$$$$$$ 
| $$$$$$$/|____  $$| $$  | $$| $$       /$$__  $$ /$$__  $$ /$$__  $$
| $$____/  /$$$$$$$| $$  | $$| $$      | $$  \ $$| $$  \__/| $$$$$$$$
| $$      /$$__  $$| $$  | $$| $$    $$| $$  | $$| $$      | $$_____/
| $$     |  $$$$$$$|  $$$$$$$|  $$$$$$/|  $$$$$$/| $$      |  $$$$$$$
|__/      \_______/ \____  $$ \______/  \______/ |__/       \_______/
                    /$$  | $$                                         
                   |  $$$$$$/                                         
                    \______/                                          
```

### Architecture
PayCore is a robust payment gateway simulator designed for adaptability and high performance.
- **Frontend**: React dashboard for monitoring and initiation.
- **Backend**: Spring Boot core handling payment logic and simulations.
- **Database**: PostgreSQL for persistent transaction lifecycle management.

### Quick Start
Ensure Docker Desktop is running, then execute:
```bash
docker compose up -d
```
The application will be accessible at [https://paycore.harshithj.me](https://paycore.harshithj.me) 

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Spring Boot 3.5.10, Java 17, Actuator
- **Database**: PostgreSQL 16
- **Orchestration**: Docker, Docker Compose, Nginx (for proxying)

### Core Features
- Strategy-pattern based payment processing.
- Real-time transaction state transitions and audit logging.
- Adaptable URL generation for cloud deployments.
- PCI-DSS compliant simulator design.

---
© 2026 PayCore Project

