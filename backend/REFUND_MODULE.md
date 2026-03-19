# Refund Processing Module

## Architecture Overview

This module implements a robust refund system using design patterns:

### Design Patterns Used

1. **Singleton Pattern** - `RefundManager`
   - Centralized refund configuration and validation
   - Single instance manages all refund business rules

2. **Strategy Pattern** - `RefundProcessor` interface
   - `FullRefundProcessor` - Handles complete refunds
   - `PartialRefundProcessor` - Handles partial refunds
   - Easily extensible for new refund types

3. **Interface Segregation Principle (ISP)**
   - Clean, focused `RefundProcessor` interface
   - Only essential methods: `supports()` and `processRefund()`

4. **Liskov Substitution Principle (LSP)**
   - All `RefundProcessor` implementations are interchangeable
   - Maintain consistent behavior contracts

## Components

### Entities
- `Refund` - Tracks refund records with status, type, and amounts
- `Transaction` - Updated with `totalRefunded` field

### Strategy Interface
```java
public interface RefundProcessor {
    boolean supports(String type);
    Refund processRefund(Transaction transaction, BigDecimal amount, String reason);
}
```

### Implementations
- `FullRefundProcessor` - Validates amount equals transaction amount
- `PartialRefundProcessor` - Validates amount is less than transaction amount

### Singleton Manager
- `RefundManager` - Validates refund rules, tracks remaining amounts

### Service Layer
- `RefundService` - Orchestrates refund processing flow

### REST APIs
- `POST /api/refund` - Process refund
- `GET /api/refunds?transactionId={id}` - Get refunds for transaction
- `GET /api/refunds/remaining/{transactionId}` - Get remaining refundable amount

## Validation Rules

1. Transaction must be in SUCCESS or SETTLED status
2. Cannot refund FAILED transactions
3. Refund amount must be positive and ≥ $1.00
4. Refund amount cannot exceed transaction amount
5. Total refunds cannot exceed original transaction amount
6. Supports multiple partial refunds

## API Examples

### Process Full Refund
```bash
POST /api/refund
{
  "transactionId": "uuid-here",
  "amount": 500.00,
  "type": "FULL",
  "reason": "Customer request"
}
```

### Process Partial Refund
```bash
POST /api/refund
{
  "transactionId": "uuid-here",
  "amount": 200.00,
  "type": "PARTIAL",
  "reason": "Partial order cancellation"
}
```

### Get Refunds for Transaction
```bash
GET /api/refunds?transactionId=uuid-here
```

### Get Remaining Refundable Amount
```bash
GET /api/refunds/remaining/uuid-here
```

## Database Schema

### refunds table
- id (UUID, PK)
- transaction_id (UUID, FK)
- amount (DECIMAL)
- status (ENUM: PENDING, PROCESSING, COMPLETED, FAILED)
- refund_type (ENUM: FULL, PARTIAL)
- reason (TEXT)
- processed_by (VARCHAR)
- created_at (TIMESTAMP)
- processed_at (TIMESTAMP)

### transactions table (updated)
- Added: total_refunded (DECIMAL) - Tracks cumulative refunded amount

## Features

✅ Full and partial refunds
✅ Multiple partial refunds support
✅ Remaining refundable amount tracking
✅ Automatic transaction status update to REFUNDED
✅ Validation against over-refunding
✅ Extensible design for new refund types
✅ Financial accuracy with BigDecimal
