// Verbindung zur Solana Devnet herstellen
const connection = new solanaWeb3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
);

let walletAddress = null; // Speichert die Wallet-Adresse des Benutzers

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    // Überprüfen, ob Phantom Wallet installiert ist
    if (!window.solana || !window.solana.isPhantom) {
        showLog("Phantom Wallet not found! Please install it from https://phantom.app");
        console.error("Phantom Wallet not detected.");
        return;
    }

    // Wallet verbinden
    document.getElementById("connect-wallet").addEventListener("click", async () => {
        try {
            const response = await window.solana.connect({ onlyIfTrusted: false });
            walletAddress = response.publicKey.toString();
            showLog(`Wallet connected: ${walletAddress}`);
            console.log(`Wallet connected: ${walletAddress}`);
        } catch (err) {
            showLog("Failed to connect wallet. Please try again.");
            console.error("Failed to connect wallet:", err);
        }
    });

    // Tokens kaufen
    document.getElementById("buy-token").addEventListener("click", async () => {
        if (!walletAddress) {
            showLog("Please connect your wallet first!");
            console.error("No wallet connected.");
            return;
        }

        const amount = document.getElementById("token-amount").value;
        if (!amount || parseFloat(amount) < 0.01) {
            showLog("Enter a valid amount of at least 0.01 SOL.");
            console.error("Invalid amount entered:", amount);
            return;
        }

        try {
            const fromPublicKey = new solanaWeb3.PublicKey(walletAddress);
            const toPublicKey = new solanaWeb3.PublicKey("4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs");
            const lamports = Math.floor(parseFloat(amount) * 1e9);

            console.log("From Wallet:", fromPublicKey.toBase58());
            console.log("To Wallet:", toPublicKey.toBase58());
            console.log("Lamports:", lamports);

            // Blockhash abrufen
            const latestBlockhash = await connection.getLatestBlockhash();
            console.log("Latest Blockhash:", latestBlockhash);

            // Transaktion erstellen
            const transaction = new solanaWeb3.Transaction({
                feePayer: fromPublicKey,
                recentBlockhash: latestBlockhash.blockhash,
            });

            const transferInstruction = solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromPublicKey,
                toPubkey: toPublicKey,
                lamports: lamports,
            });

            transaction.add(transferInstruction);
            console.log("Transaction created:", transaction);

            // Transaktion signieren
            const signedTransaction = await window.solana.signTransaction(transaction);
            console.log("Signed Transaction:", signedTransaction);

            // Transaktion senden
            const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
                skipPreflight: false,
            });

            showLog(`Transaction successful! Signature: ${signature}`);
            console.log("Transaction sent successfully:", signature);
        } catch (err) {
            showLog(`Transaction failed: ${err.message}`);
            console.error("Transaction failed:", err);
        }
    });
});

// Hilfsfunktion für Logs
function showLog(message) {
    const logElement = document.getElementById("logs");
    logElement.innerText = message;
}
