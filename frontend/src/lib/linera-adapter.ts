import {
    initialize as initLinera,
    Faucet,
    Client,
    Wallet,

    // Application, // Not exported in 0.15.4 index.d.ts
} from "@linera/client";

// Define local Application type or use any
type Application = any;
import type { Wallet as DynamicWallet } from "@dynamic-labs/sdk-react-core";
import { DynamicSigner } from "./dynamic-signer";

export interface LineraProvider {
    client: Client;
    wallet: Wallet;
    faucet: Faucet;
    address: string;
    chainId: string;
}

export class LineraAdapter {
    private static instance: LineraAdapter | null = null;
    private provider: LineraProvider | null = null;
    private application: Application | null = null;
    private appId: string | null = null;
    private wasmInitPromise: Promise<unknown> | null = null;
    private connectPromise: Promise<LineraProvider> | null = null;

    private constructor() { }

    static getInstance(): LineraAdapter {
        if (!LineraAdapter.instance) LineraAdapter.instance = new LineraAdapter();
        return LineraAdapter.instance;
    }

    async connect(
        dynamicWallet: DynamicWallet,
        rpcUrl: string
    ): Promise<LineraProvider> {
        if (this.provider) return this.provider;
        if (this.connectPromise) return this.connectPromise;

        if (!dynamicWallet) {
            throw new Error("Dynamic wallet is required for Linera connection");
        }

        try {
            this.connectPromise = (async () => {
                const { address } = dynamicWallet;
                console.log("🔗 Connecting with Dynamic wallet:", address);

                try {
                    if (!this.wasmInitPromise) this.wasmInitPromise = initLinera();
                    await this.wasmInitPromise;
                    console.log("✅ Linera WASM modules initialized successfully");
                } catch (e) {
                    console.warn("⚠️ Linera storage already initialized check:", e);
                }

                console.log("🔗 Connecting to Linera Faucet:", rpcUrl);
                const faucet = await new Faucet(rpcUrl);
                const wallet = await faucet.createWallet();

                // Note: Check argument count for claimChain if it fails, but assuming 2 as per reference
                const chainId = await faucet.claimChain(wallet, address);
                console.log("✅ Chain claimed:", chainId);

                // Wait for chain creation
                await new Promise(resolve => setTimeout(resolve, 5000));

                const signer = await new DynamicSigner(dynamicWallet);
                const client = await new Client(wallet, signer, false);
                console.log("✅ Linera wallet created successfully!");

                this.provider = {
                    client,
                    wallet,
                    faucet,
                    chainId,
                    address: dynamicWallet.address,
                };

                this.notifyListeners();
                return this.provider;
            })();

            const provider = await this.connectPromise;
            return provider;
        } catch (error) {
            console.error("Failed to connect to Linera:", error);
            throw new Error(
                `Failed to connect to Linera network: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        } finally {
            this.connectPromise = null;
        }
    }

    async setApplication(appId: string) {
        if (!this.provider) throw new Error("Not connected to Linera");
        if (!appId) throw new Error("Application ID is required");

        // Use client.frontend().application(appId)
        // Cast to any if needed to avoid type mismatch on 'frontend'
        const client: any = this.provider.client;
        const application = await client.frontend().application(appId);

        if (!application) throw new Error("Failed to get application");
        console.log("✅ Linera application set successfully!");

        this.application = application;
        this.appId = appId;
        this.notifyListeners();
    }

    async queryApplication<T>(query: string, variables?: Record<string, any>): Promise<T> {
        if (!this.application) throw new Error("Application not set");

        const queryJson = variables ? JSON.stringify({ query, variables }) : JSON.stringify({ query });
        const result = await this.application.query(queryJson);
        const response = JSON.parse(result);

        if (response.errors) {
            console.error("GraphQL Errors:", response.errors);
            throw new Error(response.errors[0].message);
        }

        return response.data as T;
    }

    async mutate(mutation: string, variables?: Record<string, any>): Promise<any> {
        if (!this.application) throw new Error("Application not set");

        const payload = variables ? { query: mutation, variables } : { query: mutation };
        const result = await this.application.query(JSON.stringify(payload));
        const response = JSON.parse(result);

        if (response.errors) {
            console.error("GraphQL Errors:", response.errors);
            throw new Error(response.errors[0].message);
        }

        return response.data;
    }

    getProvider(): LineraProvider {
        if (!this.provider) throw new Error("Provider not set");
        return this.provider;
    }

    identity(): string {
        if (!this.provider) throw new Error("Not connected to Linera");
        return this.provider.address;
    }

    isChainConnected(): boolean {
        return this.provider !== null;
    }

    isApplicationSet(): boolean {
        return this.application !== null;
    }

    private listeners = new Set<() => void>();

    private notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }

    subscribe(callback: () => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    reset(): void {
        this.application = null;
        this.appId = null;
        this.provider = null;
        this.connectPromise = null;
        this.notifyListeners();
    }
}

export const lineraAdapter = LineraAdapter.getInstance();
