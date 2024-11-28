// Buffer-Polyfill für Browser hinzufügen
window.Buffer = window.Buffer || require('buffer').Buffer;

// Verbindung zur Solana Blockchain herstellen
const connection = new solanaWeb3.Connection(
    "https://api.mainnet-beta.solana.com", // Für Mainnet Beta (oder ändere zu Devnet für Tests)
    "confirmed"
);

let walletAddress = null; // Speichert die Wallet-Adresse des Benutzers

// Funktion: Wallet verbinden
document.getElementById("connect-wallet").addEventListener("click", async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            walletAddress = response.publicKey.toString();
            alert(`Wallet connected: ${walletAddress}`);
            console.log(`Wallet connected: ${walletAddress}`);
        } catch (err) {
            console.error("Wallet connection failed:", err);
            alert("Wallet connection failed. Please try again.");
        }
    } else {
        alert("Phantom Wallet not found! Please install it from https://phantom.app");
    }
});

// Funktion: Tokens kaufen
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
        console.log("Initiating transaction...");

        // Transaktion erstellen
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(walletAddress), // Käufer-Wallet
                toPubkey: new solanaWeb3.PublicKey("4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs"), // Verkäufer-Wallet
                lamports: parseFloat(amount) * 1e9 // Betrag in Lamports (1 SOL = 1e9 Lamports)
            })
        );

        // Transaktion signieren und senden
        const { signature } = await window.solana.signAndSendTransaction(transaction);
        alert(`Transaction successful! Signature: ${signature}`);
        console.log(`Transaction successful! Signature: ${signature}`);
    } catch (err) {
        console.error("Transaction failed:", err);
        alert("Transaction failed. Please try again. Check console for details.");
    }
});


