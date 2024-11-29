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

    // Wallet beim Laden der Seite trennen
    if (window.solana && window.solana.isPhantom) {
        console.log("Disconnecting wallet on page load...");
        walletAddress = null; // Wallet-Adresse zurücksetzen
    }

    // Wallet verbinden
    document.getElementById("connect-wallet").addEventListener("click", async () => {
        console.log("Connect Wallet button clicked");

        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                walletAddress = response.publicKey.toString(); // Speichere die verbundene Wallet-Adresse
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
            // Überprüfe, ob walletAddress und Zieladresse gültig sind
            const fromPublicKey = new solanaWeb3.PublicKey(walletAddress);
            const toPublicKey = new solanaWeb3.PublicKey("4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs");

            // Konvertiere Betrag in Lamports (1 SOL = 1e9 Lamports)
            const lamports = Math.floor(parseFloat(amount) * 1e9);

            console.log("Creating transaction...");
            console.log(`From Wallet: ${fromPublicKey.toBase58()}`);
            console.log(`To Wallet: ${toPublicKey.toBase58()}`);
            console.log(`Lamports: ${lamports}`);

            // Überprüfe Parameter
            if (!fromPublicKey || !toPublicKey || !lamports || lamports <= 0) {
                throw new Error("Invalid transaction parameters");
            }

            // Erstelle die Transaktion
            const transaction = new solanaWeb3.Transaction();
            const instruction = solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromPublicKey,
                toPubkey: toPublicKey,
                lamports: lamports,
            });

            transaction.add(instruction);
            console.log("Transaction created successfully:", transaction);

            // Signiere die Transaktion mit Phantom Wallet
            console.log("Signing transaction...");
            const signedTransaction = await window.solana.signTransaction(transaction);
            console.log("Transaction signed successfully");

            // Sende die Transaktion an die Solana Blockchain
            console.log("Sending transaction to network...");
            const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
                skipPreflight: false,
            });
            console.log("Transaction sent to network. Signature:", signature);

            alert(`Transaction successful! Signature: ${signature}`);
        } catch (err) {
            console.error("Transaction failed:", err);
            alert(`Transaction failed. Error: ${err.message}`);
        }
    });
});



