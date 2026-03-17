import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PaymentService } from './services/PaymentService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize payment service
const paymentService = new PaymentService();

// Routes
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
    console.log(`  GET  /health`);
});