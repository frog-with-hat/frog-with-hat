// Buffer-Polyfill für Browser hinzufügen
window.Buffer = window.Buffer || globalThis.Buffer;

// Verbindung zur Solana Devnet herstellen
const connection = new solanaWeb3.Connection(
    "https://api.devnet.solana.com", // Devnet API-Endpunkt
    "confirmed"
);

let walletAddress = null; // Speichert die Wallet-Adresse des Benutzers

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    // Wallet verbinden
    document.getElementById("connect-wallet").addEventListener("click", async () => {
        console.log("Connect Wallet button clicked");

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

    // Tokens kaufen
    document.getElementById("buy-token").addEventListener("click", async () => {
        console.log("Buy Tokens button clicked");

        if (!walletAddress) {
            alert("Please connect your wallet first!");
            console.error("No wallet connected");
            return;
        }

        const amount = document.getElementById("token-amount").value;
        if (!amount || parseFloat(amount) < 0.01) {
            alert("Enter a valid amount of at least 0.01 SOL!");
            console.error("Invalid amount entered:", amount);
            return;
        }

        try {
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(walletAddress), // Verbundene Wallet-Adresse
                    toPubkey: new solanaWeb3.PublicKey("4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs"), // Ziel-Wallet
                    lamports: Math.floor(parseFloat(amount) * 1e9) // Betrag in Lamports (1 SOL = 1e9 Lamports)
                })
            );

            console.log("Transaction created:", transaction);

            // Transaktion signieren und senden
            const signedTransaction = await window.solana.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            alert(`Transaction successful! Signature: ${signature}`);
            console.log("Transaction successful! Signature:", signature);
        } catch (err) {
            console.error("Transaction failed:", err);
            alert("Transaction failed. Please try again.");
        }
    });
});
