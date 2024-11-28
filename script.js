// Verbindung zur Solana Blockchain
const connection = new solanaWeb3.Connection(
    "https://api.mainnet-beta.solana.com", // Mainnet (Live-Netzwerk)
    "confirmed"
);

let walletAddress = null; // Speichert die Wallet-Adresse

// Funktion zum Verbinden der Wallet
document.getElementById("connect-wallet").addEventListener("click", async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            // Verbindung mit Phantom Wallet herstellen
            const response = await window.solana.connect();
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

// Funktion zum Kauf von Tokens
document.getElementById("buy-token").addEventListener("click", async () => {
    if (!walletAddress) {
        alert("Please connect your wallet first!");
        return;
    }

    const amount = document.getElementById("token-amount").value;
    if (!amount || parseFloat(amount) < 0.01) {
        alert("Enter a valid amount of at least 0.01 SOL!");
        return;
    }

    try {
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(walletAddress),
                toPubkey: new solanaWeb3.PublicKey("4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs"), // Verkäufer-Wallet
                lamports: parseFloat(amount) * 1e9 // SOL in Lamports umrechnen
            })
        );

        const { signature } = await window.solana.signAndSendTransaction(transaction);
        alert(`Transaction successful! Signature: ${signature}`);
    } catch (err) {
        console.error("Transaction failed:", err);
        alert("Transaction failed. Please try again.");
    }
});

