const { Connection, PublicKey, Transaction, SystemProgram } = solanaWeb3;

// Wallet Details
const RECEIVER_WALLET = "4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs"; // Deine Wallet-Adresse
const SOLANA_NETWORK = "https://api.mainnet-beta.solana.com"; // Solana Mainnet

let walletAddress = null;

// Connect Wallet
document.getElementById("connect-wallet").addEventListener("click", async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect({ onlyIfTrusted: false });
            walletAddress = response.publicKey.toString();
            alert(`Wallet connected: ${walletAddress}`);
        } catch (err) {
            console.error("Wallet connection failed:", err);
            alert("Wallet connection failed. Please try again.");
        }
    } else {
        alert("Phantom Wallet not found! Please install it from https://phantom.app");
    }
});
