/**
 * Base Verification Strategy Interface
 * Following Strategy Pattern and Open-Closed Principle
 */
export class VerificationStrategy {
    /**
     * Verify the transaction with the payment provider
     * @param {Object} transaction - The transaction to verify
     * @returns {Promise<Object>} Verification result
     */
    async verify(transaction) {
        throw new Error('verify method must be implemented');
    }

    /**
     * Get the verification type this strategy handles
     * @returns {string} Verification type name
     */
    getVerificationType() {
        throw new Error('getVerificationType method must be implemented');
    }

    /**
     * Validate if the transaction can be verified by this strategy
     * @param {Object} transaction - The transaction to validate
     * @returns {boolean} true if valid, false otherwise
     */
    canVerify(transaction) {
        return this.getVerificationType().toLowerCase() === transaction.payment_method.toLowerCase();
    }

    /**
     * Create a success verification result
     * @param {Object} data - Verification data
     * @returns {Object} Success result
     */
    static success(data = {}) {
        return {
            success: true,
            status: 'SUCCESS',
            verificationData: data,
            message: 'Verification successful'
        };
    }

    /**
     * Create a failure verification result
     * @param {string} reason - Failure reason
     * @param {Object} data - Additional data
     * @returns {Object} Failure result
     */
    static failure(reason, data = {}) {
        return {
            success: false,
            status: 'FAILED',
            verificationData: data,
            failureReason: reason,
            message: `Verification failed: ${reason}`
        };
    }

    /**
     * Create a pending verification result
     * @param {string} message - Pending message
     * @param {Object} data - Additional data
     * @returns {Object} Pending result
     */
    static pending(message, data = {}) {
        return {
            success: false,
            status: 'PROCESSING',
            verificationData: data,
            message
        };
    }
}