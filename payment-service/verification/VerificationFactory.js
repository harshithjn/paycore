import { UPIVerification } from './UPIVerification.js';
import { CardVerification } from './CardVerification.js';
import { NetBankingVerification } from './NetBankingVerification.js';

/**
 * Factory for selecting appropriate verification strategy
 * Follows Open-Closed Principle - new verification strategies can be added without modifying this class
 */
export class VerificationFactory {
    constructor() {
        this.verificationStrategies = [
            new UPIVerification(),
            new CardVerification(),
            new NetBankingVerification()
        ];
        
        console.log(`Initialized VerificationFactory with ${this.verificationStrategies.length} strategies`);
        this.verificationStrategies.forEach(strategy => 
            console.log(`Registered verification strategy: ${strategy.constructor.name} for type: ${strategy.getVerificationType()}`)
        );
    }

    /**
     * Get the appropriate verification strategy for a transaction
     * @param {Object} transaction - The transaction to verify
     * @returns {VerificationStrategy|null} VerificationStrategy if found, null otherwise
     */
    getVerificationStrategy(transaction) {
        return this.verificationStrategies.find(strategy => strategy.canVerify(transaction)) || null;
    }

    /**
     * Get verification strategy by payment method
     * @param {string} paymentMethod - The payment method
     * @returns {VerificationStrategy|null} VerificationStrategy if found, null otherwise
     */
    getStrategyByMethod(paymentMethod) {
        return this.verificationStrategies.find(strategy => 
            strategy.getVerificationType().toLowerCase() === paymentMethod.toLowerCase()
        ) || null;
    }

    /**
     * Get all available verification types
     * @returns {string[]} List of verification type names
     */
    getAvailableVerificationTypes() {
        return this.verificationStrategies.map(strategy => strategy.getVerificationType());
    }
}