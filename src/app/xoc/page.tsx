"use client";

import Image from "next/image";
import {
  ConnectButton,
  useActiveAccount,
  useWalletBalance,
  useSendTransaction,
} from "thirdweb/react";
import {
  defineChain,
  getContract,
  toEther,
  prepareContractCall,
  toWei,
} from "thirdweb";
import xocIcon from "@public/xoc.svg";
import { client } from "./client";

// Define la cadena Base que quieres usar
const baseMainnet = defineChain(8453);

// Dirección del token y comunidades
const TOKEN_ADDRESS = "0xa411c9Aa00E020e4f88Bc19996d29c5B7ADB4ACf";
const NOUNSMX_ADDRESS = "0x5C3E2c131Cb10E4f4c9DF581725Bee57443D8523";
const LADAO_ADDRESS = "0x571131167e1A16D9879FA605319944Ba6E993Dd7";
const ETHMX_ADRESS = "0x7674D60760918Ae89cA71F2ce1Af2b2E740E2c8E";
const MXWEB3_ADDRESS = "0xAAc32B84554BFa4372BccEfecF42030fE5d45B61";
const MEXI_ADDRESS = "0x358E25cd4d7631eB874D25F4e1Ae4a14B0abb56E";

export default function Home() {
  const account = useActiveAccount();
  const contract = getContract({
    client,
    chain: baseMainnet,
    address: TOKEN_ADDRESS,
  });

  const { data: balance, isLoading: isLoadingBalance } = useWalletBalance({
    client,
    chain: baseMainnet,
    address: account?.address,
    tokenAddress: TOKEN_ADDRESS,
  });
  const formattedBalance = balance ? toEther(balance.value) : "0";

  const {
    mutate: sendTokenTransaction,
    isPending: isSendingToken,
    error: transactionError,
  } = useSendTransaction();

  const amountToSend = "1"; // 1 XOC token

  // Función para manejar el envío de tokens a una dirección específica
  const handleSendToken = async (recipientAddress: string, communityName: string) => {
    if (!account || !contract || !client) {
      alert("Por favor, conecta tu billetera y asegúrate de que el cliente esté inicializado.");
      return;
    }

    try {
      const tx = prepareContractCall({
        contract,
        method: "function transfer(address to, uint256 value) returns (bool)",
        params: [recipientAddress, toWei(amountToSend)],
      });
      await sendTokenTransaction(tx);
      alert(`¡Transacción de envío iniciada a ${communityName}! Revisa tu billetera para aprobar.`);
    } catch (err) {
      console.error(`Error al enviar el token a ${communityName}:`, err);
      alert(
        `Error al enviar el token a ${communityName}: ${
          err instanceof Error ? err.message : "Error desconocido"
        }`
      );
    }
  };

  // Lista de comunidades con sus direcciones y nombres
  const communities = [
    { address: NOUNSMX_ADDRESS, name: "nounsmx.eth" },
    { address: LADAO_ADDRESS, name: "La DAO" },
    { address: ETHMX_ADRESS, name: "Ethereum México" },
    { address: MXWEB3_ADDRESS, name: "mxweb3" },
    { address: MEXI_ADDRESS, name: "mexi.wtf" },
  ];

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        {/* Mostrar el saldo del token */}
        <div className="text-center mb-10">
          {account ? (
            isLoadingBalance ? (
              <p className="text-zinc-300">Cargando saldo $XOC...</p>
            ) : (
              <p className="text-zinc-100 text-lg">
                Saldo: {parseFloat(formattedBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{" "}
                $XOC
              </p>
            )
          ) : (
            <p className="text-zinc-300">Conecta tu wallet para ver el saldo $XOC</p>
          )}
        </div>

        {/* Botones para enviar tokens a cada comunidad */}
        {account && (
          <div className="flex flex-col items-center gap-4 mb-20">
            {communities.map((community) => (
              <button
                key={community.address}
                onClick={() => handleSendToken(community.address, community.name)}
                disabled={isSendingToken}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed w-full max-w-xs"
              >
                {isSendingToken
                  ? `Enviando 1 $XOC a ${community.name}...`
                  : `Dona 1 $XOC a ${community.name}`}
              </button>
            ))}
          </div>
        )}
        {transactionError && (
          <p className="text-center text-red-500 -mt-16 mb-4">
            Error: {transactionError.message.slice(0, 100)}...
          </p>
        )}

        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
            chain={baseMainnet}
            connectButton={{ label: "Conéctate" }}
            appMetadata={{
              name: "BandaWeb3 XOC App",
              url: "https://mexi.wtf",
            }}
          />
        </div>

        <ThirdwebResources />
      </div>
    </main>
  );
}

// Componentes Header, ThirdwebResources, ArticleCard sin cambios
function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={xocIcon}
        alt="XOC Icon"
        className="size-[200px] md:size-[200px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #f28500a8)",
        }}
      />
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        BandaWeb3
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-blue-500">$XOC de La DAO</span>
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
        y búscame si tienes alguna duda. XOC
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