import { PaymentProcessor } from './PaymentProcessor.js';
import { v4 as uuidv4 } from 'uuid';

export class CardProcessor extends PaymentProcessor {
    constructor() {
        super();
        this.PAYMENT_METHOD = 'CARD';
        this.PROCESSING_DELAY_MS = 4000; // Card processing is slower
    }

    async process(transaction) {
        console.log(`Processing Card payment for transaction: ${transaction.id}`);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success/failure (85% success rate for cards)
                const isSuccess = Math.random() < 0.85;
                
                if (isSuccess) {
                    const cardTransactionId = 'CARD' + uuidv4().substring(0, 8).toUpperCase();
                    console.log(`Card payment successful for transaction: ${transaction.id} with Card ID: ${cardTransactionId}`);
                    resolve(PaymentProcessor.success(cardTransactionId, 'Card payment processed successfully'));
                } else {
                    const failureReason = this.getRandomCardFailureReason();
                    console.warn(`Card payment failed for transaction: ${transaction.id} - ${failureReason}`);
                    resolve(PaymentProcessor.failure(failureReason));
                }
            }, this.PROCESSING_DELAY_MS);
        });
    }

    getPaymentMethod() {
        return this.PAYMENT_METHOD;
    }

    canProcess(transaction) {
        return super.canProcess(transaction) && transaction.amount >= 1; // Minimum card amount
    }

    getRandomCardFailureReason() {
        const reasons = [
            'Card declined by bank',
            'Insufficient funds',
            'Card expired',
            'Invalid CVV',
            'Transaction limit exceeded',
            'Card blocked'
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }
}