import { PaymentProcessor } from './PaymentProcessor.js';
import { v4 as uuidv4 } from 'uuid';

export class UPIProcessor extends PaymentProcessor {
    constructor() {
        super();
        this.PAYMENT_METHOD = 'UPI';
        this.PROCESSING_DELAY_MS = 2000; // UPI is faster
    }

    async process(transaction) {
        console.log(`Processing UPI payment for transaction: ${transaction.id}`);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success/failure (90% success rate for UPI)
                const isSuccess = Math.random() < 0.9;
                
                if (isSuccess) {
                    const upiTransactionId = 'UPI' + uuidv4().substring(0, 8).toUpperCase();
                    console.log(`UPI payment successful for transaction: ${transaction.id} with UPI ID: ${upiTransactionId}`);
                    resolve(PaymentProcessor.success(upiTransactionId, 'UPI payment completed successfully'));
                } else {
                    const failureReason = this.getRandomUPIFailureReason();
                    console.warn(`UPI payment failed for transaction: ${transaction.id} - ${failureReason}`);
                    resolve(PaymentProcessor.failure(failureReason));
                }
            }, this.PROCESSING_DELAY_MS);
        });
    }

    getPaymentMethod() {
        return this.PAYMENT_METHOD;
    }

    canProcess(transaction) {
        return super.canProcess(transaction) && transaction.amount <= 100000; // UPI limit
    }

    getRandomUPIFailureReason() {
        const reasons = [
            'Insufficient balance',
            'UPI PIN incorrect',
            'Transaction timeout',
            'Bank server unavailable',
            'Daily limit exceeded'
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }
}