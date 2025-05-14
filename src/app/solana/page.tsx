"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ConnectButton,
  useActiveAccount,
  useWalletBalance,
  useSendTransaction,
} from "@thirdweb-dev/react";
import { defineChain, getContract, toEther, prepareContractCall, toWei } from "thirdweb";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from "@solana/spl-token";
import royalbunkerIcon from "@/public/royalbunker.svg";
import { client } from "@/app/client";

// Mantle Configuration
const mantleMainnet = defineChain(5000);
const TOKEN_ADDRESS_MANTLE = "0x670984EC30A4C1b03B9f31199F8cbA233817506C";
const RECIPIENT_ADDRESS_MANTLE = "0x5C3E2c131Cb10E4f4c9DF581725Bee57443D8523";

// Solana Configuration
const TOKEN_MINT_ADDRESS_SOLANA = new PublicKey("YOUR_SPL_TOKEN_MINT_ADDRESS");
const RECIPIENT_ADDRESS_SOLANA = new PublicKey("YOUR_RECIPIENT_ADDRESS");

export default function SolanaPage() {
  // Network selector state
  const [selectedNetwork, setSelectedNetwork] = useState<"mantle" | "solana">("mantle");

  // Mantle Logic
  const account = useActiveAccount();
  const contract = getContract({
    client,
    chain: mantleMainnet,
    address: TOKEN_ADDRESS_MANTLE,
  });

  const { data: mantleBalance, isLoading: isLoadingMantleBalance } = useWalletBalance({
    client,
    chain: mantleMainnet,
    address: account?.address,
    tokenAddress: TOKEN_ADDRESS_MANTLE,
  });
  const formattedMantleBalance = mantleBalance ? toEther(mantleBalance.value) : "0";

  const {
    mutate: sendMantleToken,
    isPending: isSendingMantleToken,
    error: mantleTransactionError,
  } = useSendTransaction();

  const handleSendMantleToken = async () => {
    if (!account || !contract || !client) {
      alert("Por favor, conecta tu billetera y asegúrate de que el cliente esté inicializado.");
      return;
    }

    try {
      const tx = prepareContractCall({
        contract,
        method: "function transfer(address to, uint256 value) returns (bool)",
        params: [RECIPIENT_ADDRESS_MANTLE, toWei("1")],
      });
      await sendMantleToken(tx);
      alert("¡Transacción de envío iniciada! Revisa tu billetera para aprobar.");
    } catch (err) {
      console.error("Error al preparar o enviar la transacción de token:", err);
      alert(`Error al enviar el token: ${err instanceof Error ? err.message : "Error desconocido"}`);
    }
  };

  // Solana Logic
  const { publicKey, connected: solanaConnected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [solanaBalance, setSolanaBalance] = useState<string>("0");
  const [isLoadingSolanaBalance, setIsLoadingSolanaBalance] = useState<boolean>(false);
  const [isSendingSolanaToken, setIsSendingSolanaToken] = useState<boolean>(false);
  const [solanaTransactionError, setSolanaTransactionError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey || !solanaConnected || selectedNetwork !== "solana") {
      setSolanaBalance("0");
      return;
    }

    const fetchSolanaBalance = async () => {
      setIsLoadingSolanaBalance(true);
      try {
        const tokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS_SOLANA, publicKey);
        const accountInfo = await getAccount(connection, tokenAccount);
        const balance = Number(accountInfo.amount) / 10 ** 9; // Adjust decimals
        setSolanaBalance(balance.toFixed(4));
      } catch (err) {
        console.error("Error fetching Solana balance:", err);
        setSolanaBalance("0");
      } finally {
        setIsLoadingSolanaBalance(false);
      }
    };

    fetchSolanaBalance();
  }, [publicKey, solanaConnected, connection, selectedNetwork]);

  const handleSendSolanaToken = async () => {
    if (!publicKey || !solanaConnected || !signTransaction) {
      alert("Por favor, conecta tu billetera.");
      return;
    }

    setIsSendingSolanaToken(true);
    setSolanaTransactionError(null);

    try {
      const senderTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS_SOLANA, publicKey);
      const recipientTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS_SOLANA, RECIPIENT_ADDRESS_SOLANA);

      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          publicKey,
          BigInt(1 * 10 ** 9) // 1 token, adjust decimals
        )
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction({ signature: txId, blockhash, lastValidBlockHeight });

      alert("¡Transacción enviada! Revisa tu billetera.");
    } catch (err: any) {
      console.error("Error sending Solana token:", err);
      setSolanaTransactionError(err.message || "Error desconocido");
      alert(`Error al enviar el token: ${err.message || "Error desconocido"}`);
    } finally {
      setIsSendingSolanaToken(false);
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        {/* Network Selector */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setSelectedNetwork("mantle")}
            className={`px-4 py-2 mx-2 rounded-lg font-semibold transition-colors ${
              selectedNetwork === "mantle"
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Mantle
          </button>
          <button
            onClick={() => setSelectedNetwork("solana")}
            className={`px-4 py-2 mx-2 rounded-lg font-semibold transition-colors ${
              selectedNetwork === "solana"
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Solana
          </button>
        </div>

        {/* Display Token Balance */}
        <div className="text-center mb-10">
          {selectedNetwork === "mantle" ? (
            account ? (
              isLoadingMantleBalance ? (
                <p className="text-zinc-300">Cargando saldo $RB...</p>
              ) : (
                <p className="text-zinc-100 text-lg">
                  Saldo: {parseFloat(formattedMantleBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $RB
                </p>
              )
            ) : (
              <p className="text-zinc-300">Conecta tu wallet para ver el saldo $RB</p>
            )
          ) : solanaConnected ? (
            isLoadingSolanaBalance ? (
              <p className="text-zinc-300">Cargando saldo $RB...</p>
            ) : (
              <p className="text-zinc-100 text-lg">
                Saldo: {parseFloat(solanaBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $RB
              </p>
            )
          ) : (
            <p className="text-zinc-300">Conecta tu wallet para ver el saldo $RB</p>
          )}
        </div>

        {/* Button to Send Tokens */}
        {selectedNetwork === "mantle" && account && (
          <div className="flex justify-center mb-20">
            <button
              onClick={handleSendMantleToken}
              disabled={isSendingMantleToken}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSendingMantleToken ? "Enviando 1 $RB..." : "Envía 1 $RB a nounsmx.eth ¿estás seguro que te conviene?"}
            </button>
          </div>
        )}
        {selectedNetwork === "solana" && solanaConnected && (
          <div className="flex justify-center mb-20">
            <button
              onClick={handleSendSolanaToken}
              disabled={isSendingSolanaToken}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSendingSolanaToken ? "Enviando 1 $RB..." : "Envía 1 $RB a nounsmx.eth ¿estás seguro que te conviene?"}
            </button>
          </div>
        )}

        {/* Transaction Errors */}
        {selectedNetwork === "mantle" && mantleTransactionError && (
          <p className="text-center text-red-500 -mt-16 mb-4">
            Error: {mantleTransactionError.message.slice(0, 100)}...
          </p>
        )}
        {selectedNetwork === "solana" && solanaTransactionError && (
          <p className="text-center text-red-500 -mt-16 mb-4">
            Error: {solanaTransactionError.slice(0, 100)}...
          </p>
        )}

        {/* Wallet Connection */}
        <div className="flex justify-center mb-20">
          {selectedNetwork === "mantle" ? (
            <ConnectButton
              client={client}
              chain={mantleMainnet}
              connectButton={{ label: "Conéctate (Mantle)" }}
              appMetadata={{
                name: "Royal Bunker App",
                url: "https://mexi.wtf",
              }}
            />
          ) : (
            <WalletMultiButton
              style={{
                backgroundColor: "#f28500",
                color: "white",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
              }}
            >
              Conéctate (Solana)
            </WalletMultiButton>
          )}
        </div>

        <ThirdwebResources />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <nav className="mb-4">
        <Link href="/" className="mx-2 text-blue-400 hover:text-blue-300">
          Home (Mantle)
        </Link>
        <Link href="/solana" className="mx-2 text-blue-400 hover:text-blue-300">
          Multichain (Mantle/Solana)
        </Link>
      </nav>
      <Image
        src={royalbunkerIcon}
        alt="Royal Bunker Icon"
        className="size-[200px] md:size-[200px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #f28500a8)",
        }}
      />
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        BandaWeb3
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-blue-500">Royal Bunker</span>
      </h1>
      <p className="text-zinc-300 text-base">
        Visita{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          <a
            href="https://mexi.wtf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            mexi.wtf
          </a>
        </code>{" "}
        y búscame si tienes alguna duda.
      </p>
    </header>
  );
}

function ThirdwebResources() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center">
      <ArticleCard
        title="BandaWeb3"
        href="https://x.com/BandaWeb3"
        description="Visita el X de BandaWeb3"
      />
      <ArticleCard
        title="Meximalist"
        href="https://x.com/meximalist"
        description="Visita el X de Mexi"
      />
      <ArticleCard
        title="Historia del Royal Bunker"
        href="https://x.com/meximalist/status/1906089459835371803"
        description="Conoce más sobre el Royal Bunker"
      />
    </div>
  );
}

function ArticleCard(props: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={props.href + "?utm_source=next-template"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ConnectButton,
  useActiveAccount,
  useWalletBalance,
  useSendTransaction,
} from "@thirdweb-dev/react";
import { defineChain, getContract, toEther, prepareContractCall, toWei } from "thirdweb";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from "@solana/spl-token";
import royalbunkerIcon from "@/public/royalbunker.svg";
import { client } from "@/app/client";

// Mantle Configuration
const mantleMainnet = defineChain(5000);
const TOKEN_ADDRESS_MANTLE = "0x670984EC30A4C1b03B9f31199F8cbA233817506C";
const RECIPIENT_ADDRESS_MANTLE = "0x5C3E2c131Cb10E4f4c9DF581725Bee57443D8523";

// Solana Configuration
const TOKEN_MINT_ADDRESS_SOLANA = new PublicKey("YOUR_SPL_TOKEN_MINT_ADDRESS");
const RECIPIENT_ADDRESS_SOLANA = new PublicKey("YOUR_RECIPIENT_ADDRESS");

export default function SolanaPage() {
  // Network selector state
  const [selectedNetwork, setSelectedNetwork] = useState<"mantle" | "solana">("mantle");

  // Mantle Logic
  const account = useActiveAccount();
  const contract = getContract({
    client,
    chain: mantleMainnet,
    address: TOKEN_ADDRESS_MANTLE,
  });

  const { data: mantleBalance, isLoading: isLoadingMantleBalance } = useWalletBalance({
    client,
    chain: mantleMainnet,
    address: account?.address,
    tokenAddress: TOKEN_ADDRESS_MANTLE,
  });
  const formattedMantleBalance = mantleBalance ? toEther(mantleBalance.value) : "0";

  const {
    mutate: sendMantleToken,
    isPending: isSendingMantleToken,
    error: mantleTransactionError,
  } = useSendTransaction();

  const handleSendMantleToken = async () => {
    if (!account || !contract || !client) {
      alert("Por favor, conecta tu billetera y asegúrate de que el cliente esté inicializado.");
      return;
    }

    try {
      const tx = prepareContractCall({
        contract,
        method: "function transfer(address to, uint256 value) returns (bool)",
        params: [RECIPIENT_ADDRESS_MANTLE, toWei("1")],
      });
      await sendMantleToken(tx);
      alert("¡Transacción de envío iniciada! Revisa tu billetera para aprobar.");
    } catch (err) {
      console.error("Error al preparar o enviar la transacción de token:", err);
      alert(`Error al enviar el token: ${err instanceof Error ? err.message : "Error desconocido"}`);
    }
  };

  // Solana Logic
  const { publicKey, connected: solanaConnected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [solanaBalance, setSolanaBalance] = useState<string>("0");
  const [isLoadingSolanaBalance, setIsLoadingSolanaBalance] = useState<boolean>(false);
  const [isSendingSolanaToken, setIsSendingSolanaToken] = useState<boolean>(false);
  const [solanaTransactionError, setSolanaTransactionError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey || !solanaConnected || selectedNetwork !== "solana") {
      setSolanaBalance("0");
      return;
    }

    const fetchSolanaBalance = async () => {
      setIsLoadingSolanaBalance(true);
      try {
        const tokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS_SOLANA, publicKey);
        const accountInfo = await getAccount(connection, tokenAccount);
        const balance = Number(accountInfo.amount) / 10 ** 9; // Adjust decimals
        setSolanaBalance(balance.toFixed(4));
      } catch (err) {
        console.error("Error fetching Solana balance:", err);
        setSolanaBalance("0");
      } finally {
        setIsLoadingSolanaBalance(false);
      }
    };

    fetchSolanaBalance();
  }, [publicKey, solanaConnected, connection, selectedNetwork]);

  const handleSendSolanaToken = async () => {
    if (!publicKey || !solanaConnected || !signTransaction) {
      alert("Por favor, conecta tu billetera.");
      return;
    }

    setIsSendingSolanaToken(true);
    setSolanaTransactionError(null);

    try {
      const senderTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS_SOLANA, publicKey);
      const recipientTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS_SOLANA, RECIPIENT_ADDRESS_SOLANA);

      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          publicKey,
          BigInt(1 * 10 ** 9) // 1 token, adjust decimals
        )
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction({ signature: txId, blockhash, lastValidBlockHeight });

      alert("¡Transacción enviada! Revisa tu billetera.");
    } catch (err: any) {
      console.error("Error sending Solana token:", err);
      setSolanaTransactionError(err.message || "Error desconocido");
      alert(`Error al enviar el token: ${err.message || "Error desconocido"}`);
    } finally {
      setIsSendingSolanaToken(false);
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        {/* Network Selector */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setSelectedNetwork("mantle")}
            className={`px-4 py-2 mx-2 rounded-lg font-semibold transition-colors ${
              selectedNetwork === "mantle"
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Mantle
          </button>
          <button
            onClick={() => setSelectedNetwork("solana")}
            className={`px-4 py-2 mx-2 rounded-lg font-semibold transition-colors ${
              selectedNetwork === "solana"
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Solana
          </button>
        </div>

        {/* Display Token Balance */}
        <div className="text-center mb-10">
          {selectedNetwork === "mantle" ? (
            account ? (
              isLoadingMantleBalance ? (
                <p className="text-zinc-300">Cargando saldo $RB...</p>
              ) : (
                <p className="text-zinc-100 text-lg">
                  Saldo: {parseFloat(formattedMantleBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $RB
                </p>
              )
            ) : (
              <p className="text-zinc-300">Conecta tu wallet para ver el saldo $RB</p>
            )
          ) : solanaConnected ? (
            isLoadingSolanaBalance ? (
              <p className="text-zinc-300">Cargando saldo $RB...</p>
            ) : (
              <p className="text-zinc-100 text-lg">
                Saldo: {parseFloat(solanaBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $RB
              </p>
            )
          ) : (
            <p className="text-zinc-300">Conecta tu wallet para ver el saldo $RB</p>
          )}
        </div>

        {/* Button to Send Tokens */}
        {selectedNetwork === "mantle" && account && (
          <div className="flex justify-center mb-20">
            <button
              onClick={handleSendMantleToken}
              disabled={isSendingMantleToken}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSendingMantleToken ? "Enviando 1 $RB..." : "Envía 1 $RB a nounsmx.eth ¿estás seguro que te conviene?"}
            </button>
          </div>
        )}
        {selectedNetwork === "solana" && solanaConnected && (
          <div className="flex justify-center mb-20">
            <button
              onClick={handleSendSolanaToken}
              disabled={isSendingSolanaToken}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSendingSolanaToken ? "Enviando 1 $RB..." : "Envía 1 $RB a nounsmx.eth ¿estás seguro que te conviene?"}
            </button>
          </div>
        )}

        {/* Transaction Errors */}
        {selectedNetwork === "mantle" && mantleTransactionError && (
          <p className="text-center text-red-500 -mt-16 mb-4">
            Error: {mantleTransactionError.message.slice(0, 100)}...
          </p>
        )}
        {selectedNetwork === "solana" && solanaTransactionError && (
          <p className="text-center text-red-500 -mt-16 mb-4">
            Error: {solanaTransactionError.slice(0, 100)}...
          </p>
        )}

        {/* Wallet Connection */}
        <div className="flex justify-center mb-20">
          {selectedNetwork === "mantle" ? (
            <ConnectButton
              client={client}
              chain={mantleMainnet}
              connectButton={{ label: "Conéctate (Mantle)" }}
              appMetadata={{
                name: "Royal Bunker App",
                url: "https://mexi.wtf",
              }}
            />
          ) : (
            <WalletMultiButton
              style={{
                backgroundColor: "#f28500",
                color: "white",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
              }}
            >
              Conéctate (Solana)
            </WalletMultiButton>
          )}
        </div>

        <ThirdwebResources />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <nav className="mb-4">
        <Link href="/" className="mx-2 text-blue-400 hover:text-blue-300">
          Home (Mantle)
        </Link>
        <Link href="/solana" className="mx-2 text-blue-400 hover:text-blue-300">
          Multichain (Mantle/Solana)
        </Link>
      </nav>
      <Image
        src={royalbunkerIcon}
        alt="Royal Bunker Icon"
        className="size-[200px] md:size-[200px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #f28500a8)",
        }}
      />
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        BandaWeb3
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-blue-500">Royal Bunker</span>
      </h1>
      <p className="text-zinc-300 text-base">
        Visita{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          <a
            href="https://mexi.wtf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            mexi.wtf
          </a>
        </code>{" "}
        y búscame si tienes alguna duda.
      </p>
    </header>
  );
}

function ThirdwebResources() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center">
      <ArticleCard
        title="BandaWeb3"
        href="https://x.com/BandaWeb3"
        description="Visita el X de BandaWeb3"
      />
      <ArticleCard
        title="Meximalist"
        href="https://x.com/meximalist"
        description="Visita el X de Mexi"
      />
      <ArticleCard
        title="Historia del Royal Bunker"
        href="https://x.com/meximalist/status/1906089459835371803"
        description="Conoce más sobre el Royal Bunker"
      />
    </div>
  );
}

function ArticleCard(props: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={props.href + "?utm_source=next-template"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}