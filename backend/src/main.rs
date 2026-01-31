use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use std::sync::Mutex;
use chrono::Utc;
use uuid::Uuid;

// Blockchain structures
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Product {
    id: String,
    name: String,
    description: String,
    price: f64,
    stock: u32,
    image_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Transaction {
    id: String,
    product_id: String,
    buyer_address: String,
    seller_address: String,
    amount: f64,
    timestamp: i64,
    hash: String,
    previous_hash: String,
    nonce: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Block {
    index: u64,
    timestamp: i64,
    transactions: Vec<Transaction>,
    previous_hash: String,
    hash: String,
    nonce: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct Blockchain {
    chain: Vec<Block>,
    pending_transactions: Vec<Transaction>,
    difficulty: usize,
}

impl Blockchain {
    fn new() -> Self {
        let mut blockchain = Blockchain {
            chain: Vec::new(),
            pending_transactions: Vec::new(),
            difficulty: 2,
        };
        blockchain.create_genesis_block();
        blockchain
    }

    fn create_genesis_block(&mut self) {
        let genesis_block = Block {
            index: 0,
            timestamp: Utc::now().timestamp(),
            transactions: Vec::new(),
            previous_hash: String::from("0"),
            hash: String::from("0"),
            nonce: 0,
        };
        self.chain.push(genesis_block);
    }

    fn get_latest_block(&self) -> &Block {
        self.chain.last().unwrap()
    }

    fn calculate_hash(index: u64, timestamp: i64, transactions: &[Transaction], previous_hash: &str, nonce: u64) -> String {
        let data = format!("{}{}{:?}{}{}", index, timestamp, transactions, previous_hash, nonce);
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        hex::encode(hasher.finalize())
    }

    fn mine_block(&self, transactions: Vec<Transaction>, previous_hash: String) -> Block {
        let mut nonce = 0;
        let index = self.chain.len() as u64;
        let timestamp = Utc::now().timestamp();
        
        loop {
            let hash = Self::calculate_hash(index, timestamp, &transactions, &previous_hash, nonce);
            if hash.starts_with(&"0".repeat(self.difficulty)) {
                return Block {
                    index,
                    timestamp,
                    transactions,
                    previous_hash,
                    hash,
                    nonce,
                };
            }
            nonce += 1;
        }
    }

    fn add_transaction(&mut self, transaction: Transaction) {
        self.pending_transactions.push(transaction);
    }

    fn mine_pending_transactions(&mut self) -> Option<Block> {
        if self.pending_transactions.is_empty() {
            return None;
        }

        let previous_hash = self.get_latest_block().hash.clone();
        let transactions = self.pending_transactions.drain(..).collect();
        let block = self.mine_block(transactions, previous_hash);
        self.chain.push(block.clone());
        Some(block)
    }
}

// Application state
struct AppState {
    blockchain: Mutex<Blockchain>,
    products: Mutex<Vec<Product>>,
}

// API Request/Response structures
#[derive(Deserialize)]
struct PurchaseRequest {
    product_id: String,
    buyer_address: String,
    quantity: u32,
}

#[derive(Serialize)]
struct PurchaseResponse {
    success: bool,
    transaction_id: String,
    transaction_hash: String,
    message: String,
}

// Initialize sample products
fn init_products() -> Vec<Product> {
    vec![
        Product {
            id: Uuid::new_v4().to_string(),
            name: "Blockchain Developer Course".to_string(),
            description: "Complete guide to blockchain development with Rust and Solana".to_string(),
            price: 0.5,
            stock: 100,
            image_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400".to_string(),
        },
        Product {
            id: Uuid::new_v4().to_string(),
            name: "NFT Art Collection".to_string(),
            description: "Exclusive digital art collection on the blockchain".to_string(),
            price: 1.2,
            stock: 50,
            image_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400".to_string(),
        },
        Product {
            id: Uuid::new_v4().to_string(),
            name: "Smart Contract Template".to_string(),
            description: "Production-ready smart contract templates for e-commerce".to_string(),
            price: 0.8,
            stock: 75,
            image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400".to_string(),
        },
        Product {
            id: Uuid::new_v4().to_string(),
            name: "Web3 Starter Kit".to_string(),
            description: "Complete Web3 development toolkit with React integration".to_string(),
            price: 1.5,
            stock: 30,
            image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400".to_string(),
        },
        Product {
            id: Uuid::new_v4().to_string(),
            name: "Crypto Wallet Security Guide".to_string(),
            description: "Best practices for securing cryptocurrency wallets".to_string(),
            price: 0.3,
            stock: 200,
            image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400".to_string(),
        },
        Product {
            id: Uuid::new_v4().to_string(),
            name: "DeFi Protocol Analysis".to_string(),
            description: "In-depth analysis of popular DeFi protocols and strategies".to_string(),
            price: 2.0,
            stock: 25,
            image_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400".to_string(),
        },
    ]
}

// API Endpoints
async fn get_products(data: web::Data<AppState>) -> impl Responder {
    let products = data.products.lock().unwrap();
    HttpResponse::Ok().json(&*products)
}

async fn get_blockchain(data: web::Data<AppState>) -> impl Responder {
    let blockchain = data.blockchain.lock().unwrap();
    HttpResponse::Ok().json(&*blockchain)
}

async fn purchase_product(
    data: web::Data<AppState>,
    req: web::Json<PurchaseRequest>,
) -> impl Responder {
    let mut products = data.products.lock().unwrap();
    let mut blockchain = data.blockchain.lock().unwrap();

    // Find product
    let product = products.iter_mut().find(|p| p.id == req.product_id);
    
    if let Some(product) = product {
        if product.stock < req.quantity {
            return HttpResponse::BadRequest().json(PurchaseResponse {
                success: false,
                transaction_id: String::new(),
                transaction_hash: String::new(),
                message: "Insufficient stock".to_string(),
            });
        }

        // Create transaction
        let transaction_id = Uuid::new_v4().to_string();
        let amount = product.price * req.quantity as f64;
        let previous_hash = blockchain.get_latest_block().hash.clone();
        
        let transaction = Transaction {
            id: transaction_id.clone(),
            product_id: req.product_id.clone(),
            buyer_address: req.buyer_address.clone(),
            seller_address: "0x1234567890abcdef".to_string(), // Store address
            amount,
            timestamp: Utc::now().timestamp(),
            hash: String::new(),
            previous_hash: previous_hash.clone(),
            nonce: 0,
        };

        // Calculate transaction hash
        let tx_hash = Blockchain::calculate_hash(
            blockchain.chain.len() as u64,
            transaction.timestamp,
            &[transaction.clone()],
            &previous_hash,
            0,
        );

        let mut final_transaction = transaction;
        final_transaction.hash = tx_hash.clone();

        // Add transaction and mine block
        blockchain.add_transaction(final_transaction);
        blockchain.mine_pending_transactions();

        // Update stock
        product.stock -= req.quantity;

        HttpResponse::Ok().json(PurchaseResponse {
            success: true,
            transaction_id,
            transaction_hash: tx_hash,
            message: format!("Successfully purchased {} x{}", product.name, req.quantity),
        })
    } else {
        HttpResponse::NotFound().json(PurchaseResponse {
            success: false,
            transaction_id: String::new(),
            transaction_hash: String::new(),
            message: "Product not found".to_string(),
        })
    }
}

async fn get_transactions(data: web::Data<AppState>) -> impl Responder {
    let blockchain = data.blockchain.lock().unwrap();
    let mut all_transactions = Vec::new();
    
    for block in &blockchain.chain {
        for tx in &block.transactions {
            all_transactions.push(tx.clone());
        }
    }
    
    HttpResponse::Ok().json(all_transactions)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Starting Blockchain E-commerce Backend...");
    println!("📦 Initializing blockchain and products...");

    let app_state = web::Data::new(AppState {
        blockchain: Mutex::new(Blockchain::new()),
        products: Mutex::new(init_products()),
    });

    println!("✅ Server running at http://localhost:8080");
    println!("📡 API Endpoints:");
    println!("   GET  /api/products - List all products");
    println!("   POST /api/purchase - Purchase a product");
    println!("   GET  /api/blockchain - View blockchain");
    println!("   GET  /api/transactions - View all transactions");

    HttpServer::new(move || {
        let cors = Cors::permissive();
        
        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .route("/api/products", web::get().to(get_products))
            .route("/api/purchase", web::post().to(purchase_product))
            .route("/api/blockchain", web::get().to(get_blockchain))
            .route("/api/transactions", web::get().to(get_transactions))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
