// Verbindung zur Solana Blockchain herstellen
const connection = new solanaWeb3.Connection(
    "https://api.mainnet-beta.solana.com", // Für Mainnet Beta
    "confirmed"
);

let walletAddress = null; // Speichert die Wallet-Adresse des Benutzers

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
        // Transaktion erstellen, um SOL an die Verkäufer-Wallet zu senden
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(walletAddress), // Absender (Käufer)
                toPubkey: new solanaWeb3.PublicKey("4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs"), // Verkäufer-Wallet
                lamports: parseFloat(amount) * 1e9 // SOL in Lamports umrechnen
            })
        );

        // Transaktion signieren und senden
        const { signature } = await window.solana.signAndSendTransaction(transaction);
        alert(`Transaction successful! Signature: ${signature}`);

        // Token-Transfer-Logik hinzufügen (falls SPL-Tokens übertragen werden sollen)
        const payer = new solanaWeb3.PublicKey("4miKFSQZysmvRR6PnqQB8HzybCg1ZoF6QKaocbdtnXHs"); // Verkäufer
        const buyer = new solanaWeb3.PublicKey(walletAddress); // Käufer

        // Verbindung mit Solana Blockchain herstellen
        const payerTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            new solanaWeb3.PublicKey("5iG1EEbzz2z3PWUfzPMR5kzRcX1SuXzehsU7TL3YRrCB"), // Token Mint-Adresse
            payer
        );

        const buyerTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            new solanaWeb3.PublicKey("5iG1EEbzz2z3PWUfzPMR5kzRcX1SuXzehsU7TL3YRrCB"), // Token Mint-Adresse
            buyer
        );

        // Tokens vom Verkäufer-Wallet an das Käufer-Wallet senden
        const tokenTransferTransaction = new solanaWeb3.Transaction().add(
            splToken.createTransferInstruction(
                payerTokenAccount.address, // Verkäufer SPL-Token-Account
                buyerTokenAccount.address, // Käufer SPL-Token-Account
                payer, // Verkäufer-Wallet
                parseFloat(amount) * 10000000 // Menge der Tokens basierend auf 1 SOL = 10,000,000 Tokens
            )
        );

        const tokenSignature = await connection.sendTransaction(
            tokenTransferTransaction,
            [payer], // Signierer (Verkäufer-Wallet)
            { skipPreflight: false, preflightCommitment: "confirmed" }
        );

        alert(`Tokens successfully transferred! Token transaction signature: ${tokenSignature}`);
    } catch (err) {
        console.error("Transaction failed:", err);
        alert("Transaction failed. Please try again.");
    }
});
