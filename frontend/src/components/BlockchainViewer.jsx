import { useState, useEffect } from 'react';
import './BlockchainViewer.css';

const API_URL = 'http://localhost:8080/api';

function BlockchainViewer({ refreshTrigger }) {
    const [blockchain, setBlockchain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null);

    useEffect(() => {
        fetchBlockchain();
    }, [refreshTrigger]);

    const fetchBlockchain = async () => {
        try {
            const response = await fetch(`${API_URL}/blockchain`);
            if (!response.ok) throw new Error('Failed to fetch blockchain');
            const data = await response.json();
            setBlockchain(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const formatHash = (hash) => {
        return `${hash.slice(0, 12)}...${hash.slice(-10)}`;
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading blockchain data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>Failed to load blockchain</h3>
                <p>{error}</p>
                <button className="btn-primary" onClick={fetchBlockchain}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="blockchain-viewer fade-in">
            <div className="blockchain-header">
                <h2>Blockchain Explorer</h2>
                <p className="blockchain-subtitle">
                    View all blocks and transactions on the chain
                </p>

                <div className="blockchain-stats">
                    <div className="stat-card glass">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <span className="stat-label">Total Blocks</span>
                            <span className="stat-value">{blockchain.chain.length}</span>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-icon">⛏️</div>
                        <div className="stat-info">
                            <span className="stat-label">Difficulty</span>
                            <span className="stat-value">{blockchain.difficulty}</span>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <span className="stat-label">Pending Transactions</span>
                            <span className="stat-value">{blockchain.pending_transactions.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="blocks-list">
                {blockchain.chain.slice().reverse().map((block, index) => (
                    <div key={block.index} className="block-card glass">
                        <div className="block-header">
                            <div className="block-title">
                                <span className="block-icon">
                                    {block.index === 0 ? '🌟' : '📦'}
                                </span>
                                <div>
                                    <h3>
                                        {block.index === 0 ? 'Genesis Block' : `Block #${block.index}`}
                                    </h3>
                                    <span className="block-time">{formatDate(block.timestamp)}</span>
                                </div>
                            </div>
                            <button
                                className="btn-outline btn-small"
                                onClick={() => setSelectedBlock(selectedBlock === block.index ? null : block.index)}
                            >
                                {selectedBlock === block.index ? 'Hide Details' : 'Show Details'}
                            </button>
                        </div>

                        <div className="block-info">
                            <div className="info-row">
                                <span className="info-label">Hash</span>
                                <span className="info-value hash">{formatHash(block.hash)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Previous Hash</span>
                                <span className="info-value hash">{formatHash(block.previous_hash)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Nonce</span>
                                <span className="info-value">{block.nonce}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Transactions</span>
                                <span className="info-value">{block.transactions.length}</span>
                            </div>
                        </div>

                        {selectedBlock === block.index && block.transactions.length > 0 && (
                            <div className="block-transactions">
                                <h4>Transactions in this block:</h4>
                                {block.transactions.map((tx) => (
                                    <div key={tx.id} className="transaction-item card">
                                        <div className="tx-row">
                                            <span className="tx-label">Transaction ID</span>
                                            <span className="tx-value">{tx.id.slice(0, 16)}...</span>
                                        </div>
                                        <div className="tx-row">
                                            <span className="tx-label">Product ID</span>
                                            <span className="tx-value">{tx.product_id.slice(0, 16)}...</span>
                                        </div>
                                        <div className="tx-row">
                                            <span className="tx-label">Amount</span>
                                            <span className="tx-value amount">{tx.amount} SOL</span>
                                        </div>
                                        <div className="tx-row">
                                            <span className="tx-label">From</span>
                                            <span className="tx-value mono">{formatHash(tx.buyer_address)}</span>
                                        </div>
                                        <div className="tx-row">
                                            <span className="tx-label">To</span>
                                            <span className="tx-value mono">{formatHash(tx.seller_address)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {block.index > 0 && (
                            <div className="block-connector">
                                <div className="connector-line"></div>
                                <div className="connector-arrow">↓</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BlockchainViewer;
