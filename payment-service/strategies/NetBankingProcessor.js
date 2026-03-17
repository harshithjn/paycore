import { PaymentProcessor } from './PaymentProcessor.js';
import { v4 as uuidv4 } from 'uuid';

export class NetBankingProcessor extends PaymentProcessor {
    constructor() {
        super();
        this.PAYMENT_METHOD = 'NETBANKING';
        this.PROCESSING_DELAY_MS = 6000; // NetBanking is slowest
    }

    async process(transaction) {
        console.log(`Processing NetBanking payment for transaction: ${transaction.id}`);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success/failure (80% success rate for NetBanking)
                const isSuccess = Math.random() < 0.8;
                
                if (isSuccess) {
                    const netBankingTransactionId = 'NB' + uuidv4().substring(0, 10).toUpperCase();
                    console.log(`NetBanking payment successful for transaction: ${transaction.id} with NB ID: ${netBankingTransactionId}`);
                    resolve(PaymentProcessor.success(netBankingTransactionId, 'NetBanking payment completed successfully'));
                } else {
                    const failureReason = this.getRandomNetBankingFailureReason();
                    console.warn(`NetBanking payment failed for transaction: ${transaction.id} - ${failureReason}`);
                    resolve(PaymentProcessor.failure(failureReason));
                }
            }, this.PROCESSING_DELAY_MS);
        });
    }

    getPaymentMethod() {
        return this.PAYMENT_METHOD;
    }

    canProcess(transaction) {
        return super.canProcess(transaction) && transaction.amount >= 1; // Minimum NetBanking amount
    }

    getRandomNetBankingFailureReason() {
        const reasons = [
            'Bank server maintenance',
            'Session timeout',
            'Invalid credentials',
            'Account temporarily blocked',
            'Daily transaction limit reached',
            'Technical error at bank'
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }
}