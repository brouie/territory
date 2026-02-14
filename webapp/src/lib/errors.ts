/**
 * Parse blockchain/wallet errors into user-friendly messages
 */
export function parseError(error: Error | string | null | undefined): string {
  if (!error) return "Unknown error occurred";
  
  const message = typeof error === "string" ? error : error.message;
  const lowerMessage = message.toLowerCase();

  // User rejected transaction
  if (
    lowerMessage.includes("user rejected") ||
    lowerMessage.includes("user denied") ||
    lowerMessage.includes("rejected the request")
  ) {
    return "Transaction cancelled by user";
  }

  // Insufficient funds
  if (
    lowerMessage.includes("insufficient funds") ||
    lowerMessage.includes("insufficient balance") ||
    lowerMessage.includes("exceeds balance")
  ) {
    return "Insufficient tBNB for gas fees. Get more from the faucet.";
  }

  // Gas estimation failed
  if (lowerMessage.includes("gas required exceeds") || lowerMessage.includes("out of gas")) {
    return "Transaction would fail. Check your inputs and try again.";
  }

  // Network errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("disconnected") ||
    lowerMessage.includes("connection")
  ) {
    return "Network error. Check your internet connection.";
  }

  // Wrong chain
  if (lowerMessage.includes("chain") || lowerMessage.includes("network mismatch")) {
    return "Wrong network. Switch to opBNB Testnet (5611).";
  }

  // Contract-specific errors
  if (lowerMessage.includes("not adjacent")) {
    return "Cannot move: locations are not adjacent. Check the map connections.";
  }

  if (lowerMessage.includes("insufficient gold") || lowerMessage.includes("not enough gold")) {
    return "Not enough Gold in escrow. Deposit more Gold first.";
  }

  if (lowerMessage.includes("insufficient units") || lowerMessage.includes("not enough units")) {
    return "Not enough units. Spawn more units first.";
  }

  if (lowerMessage.includes("minimum") && lowerMessage.includes("25")) {
    return "Minimum 25 units required to attack.";
  }

  if (lowerMessage.includes("not owner") || lowerMessage.includes("unauthorized")) {
    return "You don't own this location. Capture it first.";
  }

  if (lowerMessage.includes("allowance") || lowerMessage.includes("approve")) {
    return "Token approval needed. Click Approve first.";
  }

  if (lowerMessage.includes("reverted") || lowerMessage.includes("execution reverted")) {
    // Try to extract the reason
    const revertMatch = message.match(/reason="([^"]+)"/);
    if (revertMatch) {
      return `Transaction failed: ${revertMatch[1]}`;
    }
    return "Transaction failed. Check your inputs and try again.";
  }

  // Timeout
  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return "Request timed out. Try again.";
  }

  // Nonce issues
  if (lowerMessage.includes("nonce")) {
    return "Transaction nonce error. Try refreshing the page.";
  }

  // If message is too long, truncate it
  if (message.length > 100) {
    return message.slice(0, 97) + "...";
  }

  return message;
}
