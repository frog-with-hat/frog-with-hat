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

    // Kauflogik wird hier implementiert
});
