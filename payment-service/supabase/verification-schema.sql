-- Add callback_logs table for tracking verification callbacks
CREATE TABLE IF NOT EXISTS callback_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    status_sent VARCHAR(20) NOT NULL,
    callback_url TEXT,
    response_code INTEGER,
    response_body TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_callback_logs_transaction_id ON callback_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_callback_logs_timestamp ON callback_logs(timestamp);

-- Add verification_attempts table to track verification history
CREATE TABLE IF NOT EXISTS verification_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    verification_data JSONB,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for verification attempts
CREATE INDEX IF NOT EXISTS idx_verification_attempts_transaction_id ON verification_attempts(transaction_id);

-- Add state transition logs for audit trail
CREATE TABLE IF NOT EXISTS state_transitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    transition_reason TEXT,
    transitioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for state transitions
CREATE INDEX IF NOT EXISTS idx_state_transitions_transaction_id ON state_transitions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_state_transitions_timestamp ON state_transitions(transitioned_at);

-- Update transactions table to include additional verification fields
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS callback_url TEXT,
ADD COLUMN IF NOT EXISTS callback_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE;