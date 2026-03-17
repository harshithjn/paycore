import { VerificationStrategy } from './VerificationStrategy.js';
import { v4 as uuidv4 } from 'uuid';

export class CardVerification extends VerificationStrategy {
    constructor() {
        super();
        this.VERIFICATION_TYPE = 'CARD';
        this.VERIFICATION_DELAY_MS = 3000; // Card verification takes longer
    }

    async verify(transaction) {
        console.log(`Verifying Card transaction: ${transaction.id}`);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate card verification with payment processor
                const verificationId = 'CARD_VER_' + uuidv4().substring(0, 8).toUpperCase();
                
                // Card has moderate verification success rate (88%)
                const isVerified = Math.random() < 0.88;
                
                if (isVerified) {
                    const verificationData = {
                        verificationId,
                        authorizationCode: 'AUTH_' + Date.now(),
                        cardTransactionId: transaction.upi_transaction_id || 'CARD_' + Date.now(),
                        verifiedAmount: transaction.amount,
                        cardNetwork: this.getRandomCardNetwork(),
                        processorStatus: 'APPROVED',
                        verificationTimestamp: new Date().toISOString(),
                        settlementDate: this.getSettlementDate()
                    };
                    
                    console.log(`Card verification successful for transaction: ${transaction.id}`);
                    resolve(VerificationStrategy.success(verificationData));
                } else {
                    const failureReason = this.getRandomCardFailureReason();
                    const verificationData = {
                        verificationId,
                        authorizationCode: 'DECLINED_' + Date.now(),
                        processorStatus: 'DECLINED',
                        failureCode: this.getFailureCode(failureReason),
                        cardNetwork: this.getRandomCardNetwork(),
                        verificationTimestamp: new Date().toISOString()
                    };
                    
                    console.warn(`Card verification failed for transaction: ${transaction.id} - ${failureReason}`);
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
               transaction.amount >= 1; // Minimum card amount
    }

    getRandomCardNetwork() {
        const networks = ['VISA', 'MASTERCARD', 'RUPAY', 'AMEX'];
        return networks[Math.floor(Math.random() * networks.length)];
    }

    getRandomCardFailureReason() {
        const reasons = [
            'Card issuer declined transaction',
            'Insufficient funds verified',
            'Card verification failed',
            'Transaction amount exceeds limit',
            'Card expired or invalid',
            'Processor communication error'
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    getFailureCode(reason) {
        const codes = {
            'Card issuer declined transaction': 'CARD_001',
            'Insufficient funds verified': 'CARD_002',
            'Card verification failed': 'CARD_003',
            'Transaction amount exceeds limit': 'CARD_004',
            'Card expired or invalid': 'CARD_005',
            'Processor communication error': 'CARD_006'
        };
        return codes[reason] || 'CARD_999';
    }

    getSettlementDate() {
        // Cards typically settle T+1 or T+2
        const settlementDays = Math.random() < 0.7 ? 1 : 2;
        const settlementDate = new Date();
        settlementDate.setDate(settlementDate.getDate() + settlementDays);
        return settlementDate.toISOString();
    }
}