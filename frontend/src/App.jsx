import { useState, useEffect } from 'react';
import './App.css';
import WalletConnection from './components/WalletConnection';
import ProductList from './components/ProductList';
import TransactionHistory from './components/TransactionHistory';
import BlockchainViewer from './components/BlockchainViewer';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(5.0);
  const [activeTab, setActiveTab] = useState('products');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePurchaseComplete = (amount) => {
    setBalance(prev => prev - amount);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header glass">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">⛓️</div>
              <div>
                <h2 className="logo-title">BlockShop</h2>
                <p className="logo-subtitle">Decentralized E-commerce</p>
              </div>
            </div>
            <WalletConnection 
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              balance={balance}
            />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs container">
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🛍️ Products
        </button>
        <button 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          📜 My Transactions
        </button>
        <button 
          className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`}
          onClick={() => setActiveTab('blockchain')}
        >
          ⛓️ Blockchain Explorer
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content container">
        {!walletAddress ? (
          <div className="welcome-section fade-in">
            <div className="welcome-card glass">
              <h1>Welcome to BlockShop</h1>
              <p className="welcome-text">
                Experience the future of e-commerce with blockchain technology.
                Connect your wallet to start shopping with cryptocurrency.
              </p>
              <div className="features-grid">
                <div className="feature-card card">
                  <div className="feature-icon">🔒</div>
                  <h3>Secure Transactions</h3>
                  <p>All purchases are recorded on the blockchain with cryptographic proof</p>
                </div>
                <div className="feature-card card">
                  <div className="feature-icon">⚡</div>
                  <h3>Fast & Transparent</h3>
                  <p>Instant transaction confirmation with full transparency</p>
                </div>
                <div className="feature-card card">
                  <div className="feature-icon">🌐</div>
                  <h3>Decentralized</h3>
                  <p>No intermediaries, direct peer-to-peer transactions</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'products' && (
              <ProductList 
                walletAddress={walletAddress}
                balance={balance}
                onPurchaseComplete={handlePurchaseComplete}
              />
            )}
            {activeTab === 'transactions' && (
              <TransactionHistory 
                walletAddress={walletAddress}
                refreshTrigger={refreshTrigger}
              />
            )}
            {activeTab === 'blockchain' && (
              <BlockchainViewer refreshTrigger={refreshTrigger} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>Built with React + Rust | Blockchain E-commerce Demo</p>
          <p className="footer-note">⚠️ This is a demonstration using simulated blockchain transactions</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
