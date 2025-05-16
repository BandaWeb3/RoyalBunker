"use client";

import Image from "next/image";
import Link from "next/link"; // Importa el componente Link de Next.js
import {
  ConnectButton,
  useActiveAccount,
  useWalletBalance,
  useSendTransaction,
} from "thirdweb/react";
import {
  defineChain,
  getContract,
  toEther,        // Para formatear el saldo (de wei a ether)
  prepareContractCall,
  toWei,          // Para convertir la cantidad a enviar (de ether a wei) <--- CAMBIO AQUÍ
} from "thirdweb";
// Ya no necesitas importar de "thirdweb/utils" para parseUnits

import royalbunkerIcon from "@public/rbmantle.svg";
import { client } from "./client";

// Define la cadena Mantle que quieres usar
const mantleMainnet = defineChain(5000);

// Dirección del token
const TOKEN_ADDRESS = "0x670984EC30A4C1b03B9f31199F8cbA233817506C";

export default function Home() {
  const account = useActiveAccount();
  const contract = getContract({
    client,
    chain: mantleMainnet,
    address: TOKEN_ADDRESS,
  });

  const { data: balance, isLoading: isLoadingBalance } = useWalletBalance({
    client,
    chain: mantleMainnet,
    address: account?.address,
    tokenAddress: TOKEN_ADDRESS,
  });
  const formattedBalance = balance ? toEther(balance.value) : "0";

  const {
    mutate: sendTokenTransaction,
    isPending: isSendingToken,
    error: transactionError,
  } = useSendTransaction();

  const recipientAddress = "0x5C3E2c131Cb10E4f4c9DF581725Bee57443D8523";
  const amountToSend = "1"; // 1 $RB token

  const handleSendToken = async () => {
    if (!account || !contract || !client) {
      alert("Por favor, conecta tu billetera y asegúrate de que el cliente esté inicializado.");
      return;
    }

    try {
      const tx = prepareContractCall({
        contract,
        method: "function transfer(address to, uint256 value) returns (bool)",
        params: [
          recipientAddress,
          toWei(amountToSend) // <--- USA toWei AQUÍ
        ],
      });
      await sendTokenTransaction(tx);
      alert("¡Transacción de envío iniciada! Revisa tu billetera para aprobar.");
    } catch (err) {
      console.error("Error al preparar o enviar la transacción de token:", err);
      alert(`Error al enviar el token: ${err instanceof Error ? err.message : "Error desconocido"}`);
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        {/* Mostrar el saldo del token */}
        <div className="text-center mb-10">
          {account ? (
            isLoadingBalance ? (
              <p className="text-zinc-300">Cargando saldo $RB...</p>
            ) : (
              <p className="text-zinc-100 text-lg">
                Saldo: {parseFloat(formattedBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $RB {/* Mejor formato para el saldo */}
              </p>
            )
          ) : (
            <p className="text-zinc-300">Conecta tu wallet para ver el saldo $RB</p>
          )}
        </div>

        {/* Botón para enviar tokens */}
        {account && (
          <div className="flex justify-center mb-20">
            <button
              onClick={handleSendToken}
              disabled={isSendingToken}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSendingToken ? "Enviando 1 $RB..." : "Envía 1 $RB a nounsmx.eth ¿estás seguro que te conviene?"}
            </button>
          </div>
        )}
        {transactionError && (
          <p className="text-center text-red-500 -mt-16 mb-4">
            Error: {transactionError.message.slice(0,100)}...
          </p>
        )}

        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
            chain={mantleMainnet}
            connectButton={{ label: "Conéctate" }}
            appMetadata={{
              name: "Royal Bunker App",
              url: "https://mexi.wtf",
            }}
          />
        </div>
        
        <ThirdwebResources />

{/* Sección de enlaces a las páginas Base y Solana */}
        <div className="flex justify-center gap-4 mt-10">
          <Link
            href="/base"
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Ir a Base
          </Link>
          <Link
            href="/solana"
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            Ir a Solana
          </Link>
        </div>
      </div>
    </main>
  );
}

// ... (Tus componentes Header, ThirdwebResources, ArticleCard sin cambios)
// (Asegúrate de que estos componentes estén definidos aquí o importados si están en otros archivos)
function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
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
