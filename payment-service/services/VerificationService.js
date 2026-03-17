import { createClient } from '@supabase/supabase-js';
import { VerificationFactory } from '../verification/VerificationFactory.js';
import { TransactionStateManager } from '../state/TransactionStateManager.js';
import { v4 as uuidv4 } from 'uuid';

export class VerificationService {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        this.verificationFactory = new VerificationFactory();
        this.stateManager = new TransactionStateManager();
    }

    /**
     * Get transaction status
     * @param {string} transactionId - Transaction ID
     * @returns {Promise<Object>} Transaction with status and logs
     */
    async getTransactionStatus(transactionId) {
        try {
            // Fetch transaction
            const { data: transaction, error: txnError } = await this.supabase
                .from('transactions')
                .select('*')
                .eq('id', transactionId)
                .single();

            if (txnError || !transaction) {
                throw new Error('Transaction not found');
            }

            // Fetch callback logs
            const { data: callbackLogs, error: logsError } = await this.supabase
                .from('callback_logs')
                .select('*')
                .eq('transaction_id', transactionId)
                .order('timestamp', { ascending: false });

            // Fetch state transitions
            const { data: stateTransitions, error: stateError } = await this.supabase
                .from('state_transitions')
                .select('*')
                .eq('transaction_id', transactionId)
                .order('transitioned_at', { ascending: true });

            // Fetch verification attempts
            const { data: verificationAttempts, error: verifyError } = await this.supabase
                .from('verification_attempts')
                .select('*')
                .eq('transaction_id', transactionId)
                .order('verified_at', { ascending: false });

            return {
                transaction,
                callbackLogs: callbackLogs || [],
                stateTransitions: stateTransitions || [],
                verificationAttempts: verificationAttempts || [],
                stateMetadata: {
                    currentState: transaction.status,
                    description: this.stateManager.getStateDescription(transaction.status),
                    isTerminal: this.stateManager.isTerminalState(transaction.status),
                    allowsVerification: this.stateManager.allowsVerification(transaction.status),
                    validNextStates: this.stateManager.getValidNextStates(transaction.status)
                }
            };
        } catch (error) {
            console.error('Error fetching transaction status:', error);
            throw error;
        }
    }

    /**
     * Verify transaction with payment provider
     * @param {string} transactionId - Transaction ID
     * @returns {Promise<Object>} Verification result
     */
    async verifyTransaction(transactionId) {
        try {
            console.log(`Starting verification for transaction: ${transactionId}`);

            // Fetch transaction
            const { data: transaction, error: txnError } = await this.supabase
                .from('transactions')
                .select('*')
                .eq('id', transactionId)
                .single();

            if (txnError || !transaction) {
                throw new Error('Transaction not found');
            }

            // Check if verification is allowed for current state
            if (!this.stateManager.allowsVerification(transaction.status)) {
                throw new Error(`Verification not allowed for transaction in ${transaction.status} state`);
            }

            // Get verification strategy
            const verificationStrategy = this.verificationFactory.getVerificationStrategy(transaction);
            if (!verificationStrategy) {
                throw new Error(`No verification strategy found for payment method: ${transaction.payment_method}`);
            }

            // Perform verification
            const verificationResult = await verificationStrategy.verify(transaction);

            // Log verification attempt
            await this.logVerificationAttempt(transactionId, verificationStrategy.getVerificationType(), verificationResult);

            // Update transaction status based on verification result
            const newStatus = verificationResult.status;
            if (newStatus !== transaction.status) {
                await this.updateTransactionStatus(transactionId, transaction.status, newStatus, 'Verification completed');
            }

            // Send callback if verification is complete
            if (newStatus === 'SUCCESS' || newStatus === 'FAILED') {
                await this.sendCallback(transactionId, newStatus);
            }

            return {
                transactionId,
                verificationResult,
                statusUpdated: newStatus !== transaction.status,
                callbackSent: newStatus === 'SUCCESS' || newStatus === 'FAILED'
            };

        } catch (error) {
            console.error(`Verification failed for transaction ${transactionId}:`, error);
            
            // Log failed verification attempt
            await this.logVerificationAttempt(transactionId, 'UNKNOWN', {
                success: false,
                status: 'FAILED',
                failureReason: error.message
            });

            throw error;
        }
    }

    /**
     * Update transaction status with state validation
     * @param {string} transactionId - Transaction ID
     * @param {string} fromStatus - Current status
     * @param {string} toStatus - New status
     * @param {string} reason - Reason for change
     */
    async updateTransactionStatus(transactionId, fromStatus, toStatus, reason) {
        // Validate state transition
        const validation = this.stateManager.validateTransition(fromStatus, toStatus, reason);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Update transaction
        const { error: updateError } = await this.supabase
            .from('transactions')
            .update({ 
                status: toStatus,
                last_verified_at: new Date().toISOString()
            })
            .eq('id', transactionId);

        if (updateError) {
            throw new Error('Failed to update transaction status');
        }

        // Log state transition
        await this.logStateTransition(transactionId, fromStatus, toStatus, reason);

        console.log(`Transaction ${transactionId} status updated: ${fromStatus} -> ${toStatus}`);
    }

    /**
     * Log verification attempt
     * @param {string} transactionId - Transaction ID
     * @param {string} verificationType - Type of verification
     * @param {Object} result - Verification result
     */
    async logVerificationAttempt(transactionId, verificationType, result) {
        const { error } = await this.supabase
            .from('verification_attempts')
            .insert([{
                transaction_id: transactionId,
                verification_type: verificationType,
                status: result.status,
                verification_data: result.verificationData || {}
            }]);

        if (error) {
            console.error('Failed to log verification attempt:', error);
        }
    }

    /**
     * Log state transition
     * @param {string} transactionId - Transaction ID
     * @param {string} fromStatus - Previous status
     * @param {string} toStatus - New status
     * @param {string} reason - Reason for transition
     */
    async logStateTransition(transactionId, fromStatus, toStatus, reason) {
        const { error } = await this.supabase
            .from('state_transitions')
            .insert([{
                transaction_id: transactionId,
                from_status: fromStatus,
                to_status: toStatus,
                transition_reason: reason
            }]);

        if (error) {
            console.error('Failed to log state transition:', error);
        }
    }

    /**
     * Send callback notification
     * @param {string} transactionId - Transaction ID
     * @param {string} status - Transaction status
     */
    async sendCallback(transactionId, status) {
        try {
            // Simulate callback to merchant
            const callbackData = {
                transactionId,
                status,
                timestamp: new Date().toISOString(),
                signature: this.generateCallbackSignature(transactionId, status)
            };

            // In real implementation, this would make HTTP request to merchant callback URL
            console.log(`Sending callback for transaction ${transactionId}:`, callbackData);

            // Log callback
            const { error } = await this.supabase
                .from('callback_logs')
                .insert([{
                    transaction_id: transactionId,
                    status_sent: status,
                    response_code: 200, // Simulate successful callback
                    response_body: JSON.stringify({ success: true })
                }]);

            // Update callback sent flag
            await this.supabase
                .from('transactions')
                .update({ callback_sent: true })
                .eq('id', transactionId);

            if (error) {
                console.error('Failed to log callback:', error);
            }

        } catch (error) {
            console.error(`Failed to send callback for transaction ${transactionId}:`, error);
        }
    }

    /**
     * Generate callback signature for security
     * @param {string} transactionId - Transaction ID
     * @param {string} status - Transaction status
     * @returns {string} Signature
     */
    generateCallbackSignature(transactionId, status) {
        // In real implementation, use proper HMAC with secret key
        return Buffer.from(`${transactionId}:${status}:${Date.now()}`).toString('base64');
    }

    /**
     * Get transactions for a merchant with filtering
     * @param {number} merchantId - Merchant ID
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>} Filtered transactions
     */
    async getMerchantTransactions(merchantId, filters = {}) {
        let query = this.supabase
            .from('transactions')
            .select('*')
            .eq('merchant_id', merchantId);

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.payment_method) {
            query = query.eq('payment_method', filters.payment_method);
        }

        if (filters.from_date) {
            query = query.gte('created_at', filters.from_date);
        }

        if (filters.to_date) {
            query = query.lte('created_at', filters.to_date);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error('Failed to fetch transactions');
        }

        return data || [];
    }
}