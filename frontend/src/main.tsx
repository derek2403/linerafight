import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Note: fetch-proxy removed - gRPC/HTTP2 cannot be proxied through Vite's HTTP/1.1 proxy
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

import App from "./App.tsx";
import "./index.css";

const environmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || "8856a209-2031-4e2d-bcfa-8aa794e4ac4f"; // Fallback ID for demo

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <DynamicContextProvider
            settings={{
                environmentId,
                walletConnectors: [EthereumWalletConnectors],
            }}
        >
            <App />
        </DynamicContextProvider>
    </StrictMode>
);
