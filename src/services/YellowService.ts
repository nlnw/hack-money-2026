import { NitroliteClient, WalletStateSigner, type NitroliteClientConfig } from '@erc7824/nitrolite';
import type { WalletClient } from 'viem';

// Constants
const CLEARNODE_URL = 'wss://clearnet.yellow.com/ws';

export class YellowService {
    private client: any;
    private signer: any;
    private isConnected = false;

    private listeners: ((state: any) => void)[] = [];

    constructor() {
        try {
            this.client = new NitroliteClient({ transport: { url: CLEARNODE_URL } } as any);

            // Mock receiving updates from "Network"
            setInterval(() => {
                if (this.isConnected) {
                    this.notifyListeners();
                }
            }, 3000);

        } catch (e) {
            console.warn("Yellow SDK Init Error", e);
        }
    }

    async connect(walletClient: WalletClient, address: string) {
        if (this.isConnected) return;

        try {
            console.log('Yellow SDK: Connecting to ClearNode...');
            this.signer = new WalletStateSigner(walletClient as any);

            await new Promise(r => setTimeout(r, 800)); // Sim delay
            console.log('Yellow SDK: Connected!');
            this.isConnected = true;
            this.notifyListeners();
        } catch (error) {
            console.error('Yellow SDK Connection Error:', error);
        }
    }

    async placeBet(amount: number, prediction: 'RUN' | 'PASS') {
        if (!this.isConnected) {
            console.log('Yellow SDK (Simulated): Signing bet transaction...');
        } else {
            console.log('Yellow SDK: Creating App State Update...');
        }

        await new Promise(r => setTimeout(r, 300));
        console.log(`Yellow SDK: Signed "Balance - ${amount} | Prediction: ${prediction}"`);
        this.notifyListeners();
    }

    subscribe(callback: (state: any) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners() {
        // In a real app, this would push data from the SDK
        // For now, we signal that "something changed" so the app extracts the latest state
        this.listeners.forEach(l => l({ updated: true }));
    }
}

export const yellowService = new YellowService();
