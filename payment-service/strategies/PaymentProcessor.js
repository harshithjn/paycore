/**
 * Base Payment Processor Interface
 * Following Strategy Pattern and Open-Closed Principle
 */
export class PaymentProcessor {
    /**
     * Process the payment transaction
     * @param {Object} transaction - The transaction to process
     * @returns {Promise<Object>} Processing result
     */
    async process(transaction) {
        throw new Error('process method must be implemented');
    }

    /**
     * Get the payment method this processor handles
     * @returns {string} Payment method name
     */
    getPaymentMethod() {
        throw new Error('getPaymentMethod method must be implemented');
    }

    /**
     * Validate if the transaction can be processed by this processor
     * @param {Object} transaction - The transaction to validate
     * @returns {boolean} true if valid, false otherwise
     */
    canProcess(transaction) {
        return this.getPaymentMethod().toLowerCase() === transaction.payment_method.toLowerCase();
    }

    /**
     * Create a success result
     * @param {string} transactionId - Transaction ID
     * @param {string} message - Success message
     * @returns {Object} Success result
     */
    static success(transactionId, message) {
        return {
            success: true,
            status: 'SUCCESS',
            transactionId,
            message
        };
    }

    /**
     * Create a failure result
     * @param {string} reason - Failure reason
     * @returns {Object} Failure result
     */
    static failure(reason) {
        return {
            success: false,
            status: 'FAILED',
            failureReason: reason,
            message: `Payment failed: ${reason}`
        };
    }

    /**
     * Create a processing result
     * @param {string} message - Processing message
     * @returns {Object} Processing result
     */
    static processing(message) {
        return {
            success: true,
            status: 'PROCESSING',
            message
        };
    }
}