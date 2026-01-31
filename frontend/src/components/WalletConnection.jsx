import { useState } from 'react';
import './WalletConnection.css';

function WalletConnection({ walletAddress, setWalletAddress, balance }) {
    const [isConnecting, setIsConnecting] = useState(false);

    const generateWalletAddress = () => {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    };

    const connectWallet = async () => {
        setIsConnecting(true);

        // Simulate wallet connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const address = generateWalletAddress();
        setWalletAddress(address);
        setIsConnecting(false);
    };

    const disconnectWallet = () => {
        setWalletAddress('');
    };

    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (walletAddress) {
        return (
            <div className="wallet-connected glass">
                <div className="wallet-info">
                    <div className="wallet-balance">
                        <span className="balance-label">Balance</span>
                        <span className="balance-amount">{balance.toFixed(4)} SOL</span>
                    </div>
                    <div className="wallet-address">
                        <span className="address-icon">👛</span>
                        <span className="address-text">{formatAddress(walletAddress)}</span>
                    </div>
                </div>
                <button className="btn-outline btn-disconnect" onClick={disconnectWallet}>
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="wallet-disconnected">
            <button
                className="btn-primary btn-connect"
                onClick={connectWallet}
                disabled={isConnecting}
            >
                {isConnecting ? (
                    <>
                        <span className="spinner-small"></span>
                        Connecting...
                    </>
                ) : (
                    <>
                        <span className="wallet-icon">👛</span>
                        Connect Wallet
                    </>
                )}
            </button>
        </div>
    );
}

export default WalletConnection;
