import { privateKeyToAccount } from "thirdweb/wallets";
import { verifySignature } from "thirdweb/auth";
import { NextRequest, NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";

// Ensure clientId is provided via environment variables
const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string;

if (!clientId) {
  throw new Error("No client ID provided");
}

// Initialize the Thirdweb client inside the POST function to avoid exporting invalid fields
async function initializeThirdwebClient() {
  const client = createThirdwebClient({
    clientId: clientId,
  });

  const adminAccount = privateKeyToAccount({
    privateKey: process.env.ADMIN_SECRET_KEY as string,
    client,
  });

  return { client, adminAccount };
}

// Verify Telegram credentials
async function verifyTelegram(signature: string, message: string, adminAccount: any, client: any) {
  const metadata = JSON.parse(message);

  if (!metadata.expiration || metadata.expiration < Date.now()) {
    return false;
  }

  if (!metadata.username) {
    return false;
  }

  const isValid = await verifySignature({
    client,
    address: adminAccount.address,
    message: message,
    signature,
  });

  return isValid ? metadata.username : false;
}

// Handle POST requests
export async function POST(request: NextRequest) {
  try {
    const { payload } = await request.json();
    const { signature, message } = JSON.parse(payload);

    // Initialize Thirdweb client and admin account
    const { client, adminAccount } = await initializeThirdwebClient();

    // Verify the Telegram credentials
    const userId = await verifyTelegram(signature, message, adminAccount, client);

    if (!userId) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ userId });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
