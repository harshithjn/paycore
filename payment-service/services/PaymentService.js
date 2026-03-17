import { createClient } from '@supabase/supabase-js';
import { PaymentProcessorFactory } from '../factory/PaymentProcessorFactory.js';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        this.processorFactory = new PaymentProcessorFactory();
    }

    async initiatePayment(request) {
        console.log(`Initiating payment for merchant: ${request.merchantId} with method: ${request.paymentMethod}`);
        
        // Validate payment method
        const processor = this.processorFactory.getProcessorByMethod(request.paymentMethod);
        if (!processor) {
            throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
        }

        // Create transaction with CREATED status
        const transaction = {
            id: uuidv4(),
            merchant_id: request.merchantId,
            amount: request.amount,
            payment_method: request.paymentMethod.toUpperCase(),
            status: 'CREATED',
            merchant_transaction_id: request.merchantTransactionId,
            customer_email: request.customerEmail,
            customer_phone: request.customerPhone
        };

        const { data: createdTransaction, error: createError } = await this.supabase
            .from('transactions')
            .insert([transaction])
            .select()
            .single();

        if (createError) {
            console.error('Error creating transaction:', createError);
            throw new Error('Failed to create transaction');
        }

        console.log(`Created transaction with ID: ${createdTransaction.id}`);

        // Update status to INITIATED
        const { error: updateError } = await this.supabase
            .from('transactions')
            .update({ status: 'INITIATED' })
            .eq('id', createdTransaction.id);

        if (updateError) {
            console.error('Error updating transaction status:', updateError);
        }

        // Process payment asynchronously
        this.processPaymentAsync(createdTransaction, processor);

        return {
            transactionId: createdTransaction.id,
            merchantId: createdTransaction.merchant_id,
            amount: createdTransaction.amount,
            paymentMethod: createdTransaction.payment_method,
            status: 'INITIATED',
            message: 'Payment initiated successfully',
            createdAt: createdTransaction.created_at,
            merchantTransactionId: createdTransaction.merchant_transaction_id
        };
    }

    async processPaymentAsync(transaction, processor) {
        try {
            // Update status to PROCESSING
            await this.supabase
                .from('transactions')
                .update({ status: 'PROCESSING' })
                .eq('id', transaction.id);

            // Process payment
            const result = await processor.process(transaction);
            await this.updateTransactionResult(transaction.id, result);
        } catch (error) {
            console.error(`Payment processing failed for transaction: ${transaction.id}`, error);
            const failureResult = {
                success: false,
                status: 'FAILED',
                failureReason: `Processing error: ${error.message}`
            };
            await this.updateTransactionResult(transaction.id, failureResult);
        }
    }

    async updateTransactionResult(transactionId, result) {
        const updateData = {
            status: result.status
        };

        if (result.success && result.transactionId) {
            updateData.upi_transaction_id = result.transactionId;
        }

        if (!result.success && result.failureReason) {
            updateData.failure_reason = result.failureReason;
        }

        const { error } = await this.supabase
            .from('transactions')
            .update(updateData)
            .eq('id', transactionId);

        if (error) {
            console.error('Error updating transaction result:', error);
        } else {
            console.log(`Updated transaction ${transactionId} with status: ${result.status}`);
        }
    }

    async getTransactionStatus(transactionId) {
        const { data, error } = await this.supabase
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (error) {
            console.error('Error fetching transaction:', error);
            return null;
        }

        return data;
    }

    async getMerchantTransactions(merchantId) {
        const { data, error } = await this.supabase
            .from('transactions')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching merchant transactions:', error);
            return [];
        }

        return data;
    }

    getAvailablePaymentMethods() {
        return this.processorFactory.getAvailablePaymentMethods();
    }
}