import { createAppSessionMessage, parseAnyRPCResponse as parseRPCResponse_ } from '@erc7824/nitrolite';
// Quick fix for potential missing export in some versions/builds, or if it's named differently
// We use parseAnyRPCResponse based on lint feedback, aliased to parseRPCResponse_ common name we used.

import type { WalletClient } from 'viem';

// Constants
const CLEARNODE_URL = 'wss://clearnet-sandbox.yellow.com/ws';

// Shim for parseRPCResponse
const parseRPCResponse = (data: any) => {
    // @ts-ignore
    if (parseRPCResponse_) return parseRPCResponse_(data);
    
    // Fallback simple parser
    if (typeof data === 'string') return JSON.parse(data);
    return data;
};

export class YellowService {
    private ws: WebSocket | null = null;
    public isConnected = false;
    private listeners: ((state: any) => void)[] = [];
    
    private userAddress: string | null = null;
    private messageSigner: ((message: string) => Promise<string>) | null = null;
    private sessionId: string | null = null;

    // We'll hardcode a counterparty for the "Game House" for now
    // In a real app this might be dynamic or the ClearNode itself acting as the house
    private partnerAddress = '0x0000000000000000000000000000000000000000'; // Placeholder

    constructor() {}

    async connect(walletClient: WalletClient, address: string) {
        if (this.isConnected) return;

        this.userAddress = address;
        
        // Setup message signer using viem walletClient
        this.messageSigner = async (message: string | any) => {
            // SDK passes RPCData (Array) to signer.
            const messageString = typeof message === 'string' 
                ? message 
                : JSON.stringify(message, (_, v) => typeof v === 'bigint' ? v.toString() : v);

            console.log('Yellow SDK: Signing message:', messageString);

            try {
                // Use viem's signMessage which handles the underlying RPC method details (args order, etc.)
                // and should prevent Coinbase Wallet from confusing it with TypedData
                return await walletClient.signMessage({
                    account: address as any,
                    message: messageString
                });
            } catch (e: any) {
                console.error('Yellow SDK: Signing failed', e);
                // Fallback to raw request if high level fails, but log it
                // Some wallets might stricter about hex vs string
                throw e;
            }
        };

        console.log('Yellow SDK: Connecting to Yellow Network Sandbox...');
        this.ws = new WebSocket(CLEARNODE_URL);

        this.ws.onopen = () => {
            console.log('✅ Yellow SDK: Connected to Yellow Network!');
            this.isConnected = true;
            this.notifyListeners({ connected: true });
            
            // Auto-create session on connect ONLY if we have an active bet pending recovery
            // Otherwise wait for user to bet (Lazy Session) to avoid signature spam on refresh
            const hasActiveBet = localStorage.getItem('yellow_has_active_bet') === 'true';
            if (hasActiveBet) {
                console.log('Yellow SDK: Found active bet flag, restoring session...');
                this.createSession(address);
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const message = parseRPCResponse(event.data);
                this.handleMessage(message);
            } catch (e) {
                console.error('Yellow SDK: Error parsing message', e);
            }
        };

        this.ws.onerror = (error) => {
            console.error('Yellow SDK: Connection error:', error);
            this.isConnected = false;
            this.notifyListeners({ connected: false, error });
        };
        
        this.ws.onclose = () => {
            console.log('Yellow SDK: Disconnected');
            this.isConnected = false;
            this.notifyListeners({ connected: false });
        };
    }

    async ensureSession() {
        if (this.sessionId) return;
        if (!this.userAddress) throw new Error("No user address");
        await this.createSession(this.userAddress);
        // Wait a bit for session to be confirmed? 
        // Ideally we wait for 'session_created' event but for now we await the send.
        // In a real app we'd wrap this in a promise that resolves on event.
        await new Promise(r => setTimeout(r, 2000)); 
    }

    async createSession(userAddress: string) {
        if (!this.ws || !this.messageSigner) return;

        // Use a dummy address for the "House"
        const HOUSE_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'; 

        const appDefinition = {
            protocol: 'snapshot-betting-v1',
            participants: [userAddress, HOUSE_ADDRESS],
            weights: [50, 50],
            quorum: 100,
            challenge: 0,
            nonce: Date.now()
        };

        const allocations = [
            { participant: userAddress, asset: 'usdc', amount: '1000000' }, // Virtual 1 USDC
            { participant: HOUSE_ADDRESS, asset: 'usdc', amount: '10000000' } // House bank
        ];

        try {
            console.log('Yellow SDK: Creating Session...');
            // Fix: Pass params object directly, not wrapped in array
            const sessionMessage = await createAppSessionMessage(
                this.messageSigner as any,
                { 
                    definition: appDefinition,
                    allocations: allocations
                } as any
            );

            this.ws.send(sessionMessage);
            console.log('Yellow SDK: Session Create Message Sent');
            
            // Mark as having active session capability
            localStorage.setItem('yellow_has_active_bet', 'true');
            
        } catch (e) {
            console.error('Yellow SDK: Failed to create session message', e);
            throw e; // Propagate so ensureSession fails
        }
    }

    async placeBet(amount: number, prediction: 'RUN' | 'PASS') {
        if (!this.isConnected || !this.ws || !this.messageSigner) {
            console.error('Yellow SDK: Not connected');
            throw new Error('Yellow Network not connected');
        }

        // Lazy Session Creation
        if (!this.sessionId) {
            console.log('Yellow SDK: No session, creating one before bet...');
            try {
                await this.ensureSession();
            } catch (e) {
                console.error('Yellow SDK: Failed to ensure session', e);
                return;
            }
        }

        console.log(`Yellow SDK: Placing bet ${amount} on ${prediction}`);

        const paymentData = {
            type: 'payment', // Or 'bet' if our protocol supports it
            amount: amount.toString(),
            recipient: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // House
            prediction: prediction,
            timestamp: Date.now()
        };

        try {
            // Sign the bet
            const signature = await this.messageSigner(JSON.stringify(paymentData));
            
            const signedBet = {
                ...paymentData,
                signature,
                sender: this.userAddress
            };

            this.ws.send(JSON.stringify(signedBet));
            console.log('Yellow SDK: Bet sent!', signedBet);
            
            // Optimistic update for UI
            this.notifyListeners({ 
                type: 'bet_placed', 
                amount, 
                prediction 
            });

        } catch (e) {
            console.error('Yellow SDK: Failed to sign/send bet', e);
        }
    }

    private handleMessage(message: any) {
        console.log('📨 Yellow SDK Received:', message);
        
        // Handle specific message types based on QuickStart
        if (message.type === 'session_created') {
            this.sessionId = message.sessionId;
            console.log('✅ Yellow SDK: Session Ready:', this.sessionId);
            this.notifyListeners({ type: 'session_ready', sessionId: this.sessionId });
        }
        else if (message.type === 'payment') {
            console.log('💰 Yellow SDK: Payment/Payout Received:', message.amount);
            this.notifyListeners({ type: 'payout', amount: message.amount });
            // Bet settled, we can clear the auto-restore flag if we want 
            // OR we keep it to maintain session. For now let's keep it, but maybe expire it?
            // Actually, if payout is received, maybe we can clear it.
            localStorage.removeItem('yellow_has_active_bet');
        }
        else if (message.result) {
            // RPC Response
            console.log('Yellow SDK: RPC Result:', message.result);
        }
        else if (message.error) {
            console.error('❌ Yellow SDK Error:', message.error);
        }
    }

    subscribe(callback: (state: any) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(data: any) {
        this.listeners.forEach(l => l(data));
    }
}

export const yellowService = new YellowService();

