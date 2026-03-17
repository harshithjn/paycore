import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PaymentService } from './services/PaymentService.js';
import { VerificationService } from './services/VerificationService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const paymentService = new PaymentService();
const verificationService = new VerificationService();

// Payment routes
app.post('/api/payment/initiate', async (req, res) => {
    try {
        console.log('Received payment initiation request:', req.body);
        const response = await paymentService.initiatePayment(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/payment/status/:transactionId', async (req, res) => {
    try {
        const transaction = await paymentService.getTransactionStatus(req.params.transactionId);
        if (transaction) {
            res.json(transaction);
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        console.error('Error fetching transaction status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/payment/merchant/:merchantId/transactions', async (req, res) => {
    try {
        const transactions = await paymentService.getMerchantTransactions(parseInt(req.params.merchantId));
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching merchant transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/payment/methods', async (req, res) => {
    try {
        const methods = paymentService.getAvailablePaymentMethods();
        res.json(methods);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verification routes
app.get('/api/verification/status', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Transaction ID is required' });
        }

        const statusData = await verificationService.getTransactionStatus(id);
        res.json(statusData);
    } catch (error) {
        console.error('Error fetching verification status:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/verification/verify', async (req, res) => {
    try {
        const { transactionId } = req.body;
        if (!transactionId) {
            return res.status(400).json({ error: 'Transaction ID is required' });
        }

        const verificationResult = await verificationService.verifyTransaction(transactionId);
        res.json(verificationResult);
    } catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/verification/merchant/:merchantId/transactions', async (req, res) => {
    try {
        const merchantId = parseInt(req.params.merchantId);
        const filters = {
            status: req.query.status,
            payment_method: req.query.payment_method,
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const transactions = await verificationService.getMerchantTransactions(merchantId, filters);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching merchant transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Payment service running on port ${port}`);
    console.log(`Available endpoints:`);
    console.log(`  POST /api/payment/initiate`);
    console.log(`  GET  /api/payment/status/:transactionId`);
    console.log(`  GET  /api/payment/merchant/:merchantId/transactions`);
    console.log(`  GET  /api/payment/methods`);
    console.log(`  GET  /api/verification/status?id=txn_id`);
    console.log(`  POST /api/verification/verify`);
    console.log(`  GET  /api/verification/merchant/:merchantId/transactions`);
    console.log(`  GET  /health`);
});