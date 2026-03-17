import { VerificationStrategy } from './VerificationStrategy.js';
import { v4 as uuidv4 } from 'uuid';

export class UPIVerification extends VerificationStrategy {
    constructor() {
        super();
        this.VERIFICATION_TYPE = 'UPI';
        this.VERIFICATION_DELAY_MS = 1500; // UPI verification is fast
    }

    async verify(transaction) {
        console.log(`Verifying UPI transaction: ${transaction.id}`);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate UPI verification with bank
                const verificationId = 'UPI_VER_' + uuidv4().substring(0, 8).toUpperCase();
                
                // UPI has high verification success rate (95%)
                const isVerified = Math.random() < 0.95;
                
                if (isVerified) {
                    const verificationData = {
                        verificationId,
                        bankReference: 'BANK_REF_' + Date.now(),
                        upiTransactionId: transaction.upi_transaction_id || 'UPI_' + Date.now(),
                        verifiedAmount: transaction.amount,
                        bankStatus: 'SUCCESS',
                        verificationTimestamp: new Date().toISOString()
                    };
                    
                    console.log(`UPI verification successful for transaction: ${transaction.id}`);
                    resolve(VerificationStrategy.success(verificationData));
                } else {
                    const failureReason = this.getRandomUPIFailureReason();
                    const verificationData = {
                        verificationId,
                        bankReference: 'BANK_REF_' + Date.now(),
                        bankStatus: 'FAILED',
                        failureCode: this.getFailureCode(failureReason),
                        verificationTimestamp: new Date().toISOString()
                    };
                    
                    console.warn(`UPI verification failed for transaction: ${transaction.id} - ${failureReason}`);
                    resolve(VerificationStrategy.failure(failureReason, verificationData));
                }
            }, this.VERIFICATION_DELAY_MS);
        });
    }

    getVerificationType() {
        return this.VERIFICATION_TYPE;
    }

    canVerify(transaction) {
        return super.canVerify(transaction) && 
               transaction.status === 'PROCESSING' &&
               transaction.amount <= 100000; // UPI limit
    }

    getRandomUPIFailureReason() {
        const reasons = [
            'Bank server timeout',
            'Invalid UPI transaction ID',
            'Transaction not found in bank records',
            'Amount mismatch with bank',
            'UPI transaction expired'
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    getFailureCode(reason) {
        const codes = {
            'Bank server timeout': 'UPI_001',
            'Invalid UPI transaction ID': 'UPI_002',
            'Transaction not found in bank records': 'UPI_003',
            'Amount mismatch with bank': 'UPI_004',
            'UPI transaction expired': 'UPI_005'
        };
        return codes[reason] || 'UPI_999';
    }
}