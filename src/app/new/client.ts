import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error("No client ID provided");
}

export const RBContract = "0x670984EC30A4C1b03B9f31199F8cbA233817506C"; // RB token address

export const client = createThirdwebClient({
  clientId: clientId,
});
