import { VerificationStrategy } from './VerificationStrategy.js';
import { v4 as uuidv4 } from 'uuid';

export class NetBankingVerification extends VerificationStrategy {
    constructor() {
        super();
        this.VERIFICATION_TYPE = 'NETBANKING';
        this.VERIFICATION_DELAY_MS = 4500; // NetBanking verification is slowest
    }

    async verify(transaction) {
        console.log(`Verifying NetBanking transaction: ${transaction.id}`);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate NetBanking verification with bank
                const verificationId = 'NB_VER_' + uuidv4().substring(0, 10).toUpperCase();
                
                // NetBanking has lower verification success rate (82%)
                const isVerified = Math.random() < 0.82;
                
                if (isVerified) {
                    const verificationData = {
                        verificationId,
                        bankTransactionId: transaction.upi_transaction_id || 'NB_' + Date.now(),
                        verifiedAmount: transaction.amount,
                        bankCode: this.getRandomBankCode(),
                        bankName: this.getBankName(this.getRandomBankCode()),
                        bankStatus: 'SUCCESS',
                        verificationTimestamp: new Date().toISOString(),
                        clearingDate: this.getClearingDate()
                    };
                    
                    console.log(`NetBanking verification successful for transaction: ${transaction.id}`);
                    resolve(VerificationStrategy.success(verificationData));
                } else {
                    const failureReason = this.getRandomNetBankingFailureReason();
                    const verificationData = {
                        verificationId,
                        bankCode: this.getRandomBankCode(),
                        bankStatus: 'FAILED',
                        failureCode: this.getFailureCode(failureReason),
                        verificationTimestamp: new Date().toISOString()
                    };
                    
                    console.warn(`NetBanking verification failed for transaction: ${transaction.id} - ${failureReason}`);
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
               transaction.amount >= 1; // Minimum NetBanking amount
    }

    getRandomBankCode() {
        const bankCodes = ['SBIN', 'HDFC', 'ICIC', 'AXIS', 'KOTAK', 'INDB', 'PUNB'];
        return bankCodes[Math.floor(Math.random() * bankCodes.length)];
    }

    getBankName(bankCode) {
        const bankNames = {
            'SBIN': 'State Bank of India',
            'HDFC': 'HDFC Bank',
            'ICIC': 'ICICI Bank',
            'AXIS': 'Axis Bank',
            'KOTAK': 'Kotak Mahindra Bank',
            'INDB': 'IndusInd Bank',
            'PUNB': 'Punjab National Bank'
        };
        return bankNames[bankCode] || 'Unknown Bank';
    }

    getRandomNetBankingFailureReason() {
        const reasons = [
            'Bank server maintenance in progress',
            'Session timeout during verification',
            'Transaction not found in bank system',
            'Account verification failed',
            'Daily transaction limit exceeded',
            'Bank communication error'
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    getFailureCode(reason) {
        const codes = {
            'Bank server maintenance in progress': 'NB_001',
            'Session timeout during verification': 'NB_002',
            'Transaction not found in bank system': 'NB_003',
            'Account verification failed': 'NB_004',
            'Daily transaction limit exceeded': 'NB_005',
            'Bank communication error': 'NB_006'
        };
        return codes[reason] || 'NB_999';
    }

    getClearingDate() {
        // NetBanking typically clears same day or next day
        const clearingDays = Math.random() < 0.6 ? 0 : 1;
        const clearingDate = new Date();
        clearingDate.setDate(clearingDate.getDate() + clearingDays);
        return clearingDate.toISOString();
    }
}