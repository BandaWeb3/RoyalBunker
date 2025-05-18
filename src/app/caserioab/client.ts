import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error("No client ID provided");
}

export const tokenAddress = "0x670984EC30A4C1b03B9f31199F8cbA233817506C"; // RB token address
export const factoryAddress = "0x5D9aDaBEb55B6F28f8C47e0f6a16cA7b6E5F80e1";

export const client = createThirdwebClient({
  clientId: clientId,
});

