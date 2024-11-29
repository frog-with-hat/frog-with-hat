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

    // Überprüfen, ob Phantom Wallet installiert ist
    if (!window.solana || !window.solana.isPhantom) {
        alert("Phantom Wallet not found! Please install it from https://phantom.app");
        console.error("Phantom Wallet not detected.");
        return;
    }

    // Event-Listener für den "Connect Wallet"-Button
    document.getElementById("connect-wallet").addEventListener("click", async () => {
        console.log("Connect Wallet button clicked");

        try {
            const response = await window.solana.connect({ onlyIfTrusted: false });
            walletAddress = response.publicKey.toString();
            alert(`Wallet connected: ${walletAddress}`);
            console.log(`Wallet connected: ${walletAddress}`);
        } catch (err) {
            console.error("Failed to connect wallet:", err);
            alert("Failed to connect wallet. Please try again.");
        }
    });

    // Event-Listener für den "Buy Tokens"-Button
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
            // Überprüfen, ob Phantom Wallet weiterhin verbunden ist
            if (!window.solana.isConnected) {
                alert("Wallet disconnected. Please reconnect.");
                console.error("Wallet is not connected.");
                return;
            }

            // PublicKeys für Sender und Empfänger erstellen
            const fromPublicKey = new solanaWeb3.PublicKey(walletAddress);
            const toPublicKey = new solanaWeb3.PublicKey("4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs");

            if (!fromPublicKey || !toPublicKey) {
                throw new Error("Invalid PublicKeys provided");
            }

            // Betrag in Lamports konvertieren (1 SOL = 1e9 Lamports)
            const lamports = Math.floor(parseFloat(amount) * 1e9);
            if (lamports <= 0) {
                throw new Error("Invalid Lamports value");
            }

            console.log("From Wallet:", fromPublicKey.toBase58());
            console.log("To Wallet:", toPublicKey.toBase58());
            console.log("Lamports:", lamports);

            // Blockhash abrufen, um Transaktion zu erstellen
            const latestBlockhash = await connection.getLatestBlockhash("finalized");
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

            console.log("Transaction object created:", transaction);

            // Transaktion signieren
            console.log("Signing transaction...");
            const signedTransaction = await window.solana.signTransaction(transaction);
            console.log("Signed Transaction:", signedTransaction);

            // Transaktion an das Netzwerk senden
            console.log("Sending transaction...");
            const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
                skipPreflight: false,
            });

            console.log("Transaction sent successfully. Signature:", signature);
            alert(`Transaction successful! Signature: ${signature}`);
        } catch (err) {
            console.error("Transaction failed:", err);
            alert(`Transaction failed: ${err.message}`);
        }
    });
});

