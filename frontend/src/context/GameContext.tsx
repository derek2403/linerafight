import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { lineraAdapter } from '../lib/linera-adapter';
import { CONTRACTS_APP_ID } from '../constants';

interface GameContextType {
    lineraData: { chainId: string; address: string; balance: string } | null;
    isConnecting: boolean;
    refreshData: () => Promise<void>;
    startGame: (wager: number) => Promise<void>;
    processWave: (wave: number) => Promise<string | null>;
    endGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const { primaryWallet } = useDynamicContext();
    const [lineraData, setLineraData] = useState<{ chainId: string; address: string; balance: string } | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const refreshData = useCallback(async () => {
        if (!primaryWallet || !lineraAdapter.isChainConnected()) return;
        const provider = lineraAdapter.getProvider();
        let balance = "0";
        try {
            balance = await provider.client.balance();
        } catch (e) {
            console.warn("Failed to fetch balance in refresh:", e);
        }

        setLineraData({
            chainId: provider.chainId,
            address: provider.address,
            balance,
        });
    }, [primaryWallet]);

    const startGame = async (wager: number) => {
        if (!lineraAdapter.isApplicationSet()) {
            // Try to set app ID if missing
            try { await lineraAdapter.setApplication(CONTRACTS_APP_ID); } catch (e) { }
        }

        console.log(`Starting game with wager: ${wager}`);

        // Reset state from any previous stuck game
        try {
            await lineraAdapter.mutate("mutation { reset }");
        } catch (e) { /* ignore if no game active */ }

        const mutation = `mutation StartGame($wager: Int!) { startGame(wager: $wager) }`;
        await lineraAdapter.mutate(mutation, { wager });
        await refreshData();
    };

    const processWave = async (wave: number): Promise<string | null> => {
        if (!lineraAdapter.isApplicationSet()) return null;

        console.log(`Processing Wave ${wave} (Battle/Hit)`);

        try {
            const mutation = `mutation { battle }`;
            await lineraAdapter.mutate(mutation);
            // Fetch result to check if overwhelmed
            const result = await checkGameResult();
            await refreshData();
            return result;
        } catch (e) {
            console.error("Battle failed:", e);
            // If battle failed, maybe we aren't in battle phase?
            return "Error";
        }
    };

    const endGame = async () => {
        if (!lineraAdapter.isApplicationSet()) return;
        console.log("Ending Game (Stand/Cash Out)");
        try {
            const mutation = `mutation { endWave }`;
            await lineraAdapter.mutate(mutation);
            await refreshData();
        } catch (e) {
            console.error("EndGame failed:", e);
        }
    };

    const checkGameResult = async (): Promise<string | null> => {
        const owner = lineraAdapter.identity();
        const query = `
            query GetResult($owner: AccountOwner!) {
                player(owner: $owner) {
                    lastResult
                }
            }
        `;
        const data = await lineraAdapter.queryApplication<{ player: { lastResult: string } }>(query, { owner });
        return data.player?.lastResult || null;
    };


    useEffect(() => {
        const connectToLinera = async () => {
            if (primaryWallet) {
                if (!lineraAdapter.isChainConnected()) {
                    try {
                        setIsConnecting(true);
                        const faucetUrl = import.meta.env.VITE_LINERA_FAUCET_URL || 'https://faucet.testnet-conway.linera.net/';
                        await lineraAdapter.connect(primaryWallet, faucetUrl);

                        try {
                            if (!lineraAdapter.isApplicationSet()) {
                                await lineraAdapter.setApplication(CONTRACTS_APP_ID);
                            }
                        } catch (e) {
                            console.warn("Failed to set application:", e);
                        }

                        await refreshData();
                    } catch (error) {
                        console.error("Failed to connect to Linera:", error);
                    } finally {
                        setIsConnecting(false);
                    }
                } else {
                    refreshData();
                }
            } else if (!primaryWallet) {
                setLineraData(null);
                lineraAdapter.reset();
            }
        };

        connectToLinera();
    }, [primaryWallet, refreshData]);

    return (
        <GameContext.Provider value={{ lineraData, isConnecting, refreshData, startGame, processWave, endGame }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
