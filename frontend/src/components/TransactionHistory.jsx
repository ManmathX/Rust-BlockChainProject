import { useState, useEffect } from 'react';
import './TransactionHistory.css';

const API_URL = 'http://localhost:8080/api';

function TransactionHistory({ walletAddress, refreshTrigger }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, [refreshTrigger]);

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${API_URL}/transactions`);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();

            // Filter transactions for current wallet
            const userTransactions = data.filter(
                tx => tx.buyer_address === walletAddress
            );

            setTransactions(userTransactions);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const formatHash = (hash) => {
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading transaction history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>Failed to load transactions</h3>
                <p>{error}</p>
                <button className="btn-primary" onClick={fetchTransactions}>
                    Retry
                </button>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="empty-state fade-in">
                <div className="empty-icon">📜</div>
                <h3>No Transactions Yet</h3>
                <p>Your purchase history will appear here once you make your first transaction.</p>
            </div>
        );
    }

    return (
        <div className="transaction-history fade-in">
            <div className="history-header">
                <h2>Transaction History</h2>
                <p className="history-subtitle">
                    All your purchases recorded on the blockchain
                </p>
                <div className="transaction-stats">
                    <div className="stat-card glass">
                        <div className="stat-icon">🛍️</div>
                        <div className="stat-info">
                            <span className="stat-label">Total Purchases</span>
                            <span className="stat-value">{transactions.length}</span>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <span className="stat-label">Total Spent</span>
                            <span className="stat-value">
                                {transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(4)} SOL
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="transactions-list">
                {transactions.map((tx) => (
                    <div key={tx.id} className="transaction-card glass">
                        <div className="transaction-header">
                            <div className="transaction-id">
                                <span className="tx-icon">🔗</span>
                                <span className="tx-hash">{formatHash(tx.hash)}</span>
                            </div>
                            <span className="badge badge-success">Confirmed</span>
                        </div>

                        <div className="transaction-details">
                            <div className="detail-row">
                                <span className="detail-label">Product ID</span>
                                <span className="detail-value">{tx.product_id.slice(0, 8)}...</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Amount</span>
                                <span className="detail-value amount">{tx.amount} SOL</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Date</span>
                                <span className="detail-value">{formatDate(tx.timestamp)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">From</span>
                                <span className="detail-value mono">{formatHash(tx.buyer_address)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">To</span>
                                <span className="detail-value mono">{formatHash(tx.seller_address)}</span>
                            </div>
                        </div>

                        <div className="transaction-footer">
                            <button className="btn-outline btn-small">
                                View on Explorer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TransactionHistory;
