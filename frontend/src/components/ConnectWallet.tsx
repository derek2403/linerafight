import React from 'react';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

const ConnectWallet: React.FC = () => {
    return (
        <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <DynamicWidget />
        </div>
    );
};

export default ConnectWallet;
