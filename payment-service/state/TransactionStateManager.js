/**
 * Transaction State Manager
 * Manages transaction state transitions following business rules
 * Follows Open-Closed Principle for adding new states and transitions
 */
export class TransactionStateManager {
    constructor() {
        // Define valid state transitions
        this.validTransitions = {
            'CREATED': ['INITIATED', 'FAILED'],
            'INITIATED': ['PROCESSING', 'FAILED'],
            'PROCESSING': ['SUCCESS', 'FAILED'],
            'SUCCESS': ['REFUNDED', 'SETTLED'],
            'FAILED': ['PROCESSING'], // Allow retry
            'REFUNDED': ['SETTLED'],
            'SETTLED': [] // Terminal state
        };

        // Define state metadata
        this.stateMetadata = {
            'CREATED': {
                description: 'Transaction created but not yet initiated',
                isTerminal: false,
                allowsVerification: false
            },
            'INITIATED': {
                description: 'Transaction initiated and sent for processing',
                isTerminal: false,
                allowsVerification: false
            },
            'PROCESSING': {
                description: 'Transaction is being processed by payment provider',
                isTerminal: false,
                allowsVerification: true
            },
            'SUCCESS': {
                description: 'Transaction completed successfully',
                isTerminal: false,
                allowsVerification: true
            },
            'FAILED': {
                description: 'Transaction failed',
                isTerminal: false,
                allowsVerification: true
            },
            'REFUNDED': {
                description: 'Transaction amount has been refunded',
                isTerminal: false,
                allowsVerification: false
            },
            'SETTLED': {
                description: 'Transaction has been settled',
                isTerminal: true,
                allowsVerification: false
            }
        };
    }

    /**
     * Check if a state transition is valid
     * @param {string} fromState - Current state
     * @param {string} toState - Target state
     * @returns {boolean} True if transition is valid
     */
    isValidTransition(fromState, toState) {
        if (!fromState || !toState) return false;
        
        const allowedTransitions = this.validTransitions[fromState];
        return allowedTransitions && allowedTransitions.includes(toState);
    }

    /**
     * Get all valid next states for a given state
     * @param {string} currentState - Current state
     * @returns {string[]} Array of valid next states
     */
    getValidNextStates(currentState) {
        return this.validTransitions[currentState] || [];
    }

    /**
     * Check if a state allows verification
     * @param {string} state - State to check
     * @returns {boolean} True if verification is allowed
     */
    allowsVerification(state) {
        const metadata = this.stateMetadata[state];
        return metadata ? metadata.allowsVerification : false;
    }

    /**
     * Check if a state is terminal (no further transitions allowed)
     * @param {string} state - State to check
     * @returns {boolean} True if state is terminal
     */
    isTerminalState(state) {
        const metadata = this.stateMetadata[state];
        return metadata ? metadata.isTerminal : false;
    }

    /**
     * Get state description
     * @param {string} state - State to describe
     * @returns {string} State description
     */
    getStateDescription(state) {
        const metadata = this.stateMetadata[state];
        return metadata ? metadata.description : 'Unknown state';
    }

    /**
     * Get all available states
     * @returns {string[]} Array of all states
     */
    getAllStates() {
        return Object.keys(this.stateMetadata);
    }

    /**
     * Validate state transition with reason
     * @param {string} fromState - Current state
     * @param {string} toState - Target state
     * @param {string} reason - Reason for transition
     * @returns {Object} Validation result
     */
    validateTransition(fromState, toState, reason = '') {
        if (!this.isValidTransition(fromState, toState)) {
            return {
                valid: false,
                error: `Invalid transition from ${fromState} to ${toState}`,
                allowedTransitions: this.getValidNextStates(fromState)
            };
        }

        if (this.isTerminalState(fromState)) {
            return {
                valid: false,
                error: `Cannot transition from terminal state ${fromState}`,
                allowedTransitions: []
            };
        }

        return {
            valid: true,
            fromState,
            toState,
            reason,
            timestamp: new Date().toISOString()
        };
    }
}