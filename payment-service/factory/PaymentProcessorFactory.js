import { UPIProcessor } from '../strategies/UPIProcessor.js';
import { CardProcessor } from '../strategies/CardProcessor.js';
import { NetBankingProcessor } from '../strategies/NetBankingProcessor.js';

/**
 * Factory for selecting appropriate payment processor
 * Follows Open-Closed Principle - new processors can be added without modifying this class
 */
export class PaymentProcessorFactory {
    constructor() {
        this.processors = [
            new UPIProcessor(),
            new CardProcessor(),
            new NetBankingProcessor()
        ];
        
        console.log(`Initialized PaymentProcessorFactory with ${this.processors.length} processors`);
        this.processors.forEach(processor => 
            console.log(`Registered processor: ${processor.constructor.name} for method: ${processor.getPaymentMethod()}`)
        );
    }

    /**
     * Get the appropriate payment processor for a transaction
     * @param {Object} transaction - The transaction to process
     * @returns {PaymentProcessor|null} PaymentProcessor if found, null otherwise
     */
    getProcessor(transaction) {
        return this.processors.find(processor => processor.canProcess(transaction)) || null;
    }

    /**
     * Get processor by payment method name
     * @param {string} paymentMethod - The payment method
     * @returns {PaymentProcessor|null} PaymentProcessor if found, null otherwise
     */
    getProcessorByMethod(paymentMethod) {
        return this.processors.find(processor => 
            processor.getPaymentMethod().toLowerCase() === paymentMethod.toLowerCase()
        ) || null;
    }

    /**
     * Get all available payment methods
     * @returns {string[]} List of payment method names
     */
    getAvailablePaymentMethods() {
        return this.processors.map(processor => processor.getPaymentMethod());
    }
}