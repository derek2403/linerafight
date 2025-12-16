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
        console.log("🎮 startGame called with wager:", wager);

        if (!lineraAdapter.isApplicationSet()) {
            console.log("🎮 Application not set, trying to set...");
            try {
                await lineraAdapter.setApplication(CONTRACTS_APP_ID);
                console.log("🎮 Application set successfully");
            } catch (e) {
                console.error("🎮 Failed to set application:", e);
            }
        }

        // Only ONE transaction: startGame
        console.log("🎮 Sending StartGame mutation...");
        const mutation = `mutation StartGame($wager: Int!) { startGame(wager: $wager) }`;
        try {
            const result = await lineraAdapter.mutate(mutation, { wager });
            console.log("🎮 StartGame result:", result);
        } catch (e) {
            console.error("🎮 StartGame mutation failed:", e);
            throw e;
        }

        await refreshData();
        console.log("🎮 startGame completed");
    };

    const processWave = async (wave: number): Promise<string | null> => {
        // NOTE: We no longer send chain mutations per wave/hit.
        // The game logic is handled locally in Game.tsx.
        // Only startGame and endGame trigger on-chain transactions.
        console.log(`📊 Wave ${wave} processed locally (no chain mutation)`);
        return null;
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
