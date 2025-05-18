"use client";

import Image from "next/image";
import {  defineChain,
          getContract,
          toEther,
          prepareContractCall,
          toWei,
 } from "thirdweb";
 import {
   TransactionButton
 } from "thirdweb/react";
import { ConnectButton,
         useActiveAccount,
         useWalletBalance,
 } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { client, RBContract } from "./client";

// Define la cadena Mantle que quieres usar
const mantleMainnet = defineChain(11155111);
const wallets = [
  inAppWallet({
    auth: {
      options: [
        "discord",
        "telegram",
        "farcaster",
        "email",
        "x",
        "passkey",
        "github",
        "google",
        "apple",
        "facebook",
      ],
    },
  }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("io.metamask"),
];

export default function Home() {
  const account = useActiveAccount();
  const contract = getContract({
    client,
    chain: mantleMainnet,
    address: RBContract,
  });
  const { data: balance, isLoading: isLoadingBalance } = useWalletBalance({
    client,
    chain: mantleMainnet,
    address: account?.address,
    tokenAddress: RBContract,
  });
  const formattedBalance = balance ? toEther(balance.value) : "0";
  const recipientAddress = "0x5C3E2c131Cb10E4f4c9DF581725Bee57443D8523";
  const amountToSend = "1"; // 1 $RB token

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
                Saldo: {parseFloat(formattedBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $RB
              </p>
            )
          ) : (
            <p className="text-zinc-300">Conecta tu wallet para ver el saldo $RB</p>
          )}
        </div>


        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
            wallets={wallets}
               accountAbstraction={{
               chain: mantleMainnet, // replace with the chain you want
               sponsorGas: true,
      }}
            appMetadata={{
              name: "Example App",
              url: "https://example.com",
            }}
          />

          <TransactionButton
            transaction={() =>
              prepareContractCall({
                contract,
                method: "function transfer(address to, uint256 value) returns (bool)",
                params: [recipientAddress, toWei(amountToSend)],
              })
            }
          >
            Transfer 1 $RB
          </TransactionButton>
          </div>
        <ThirdwebResources />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        thirdweb SDK
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-blue-500"> Next.js </span>
      </h1>

      <p className="text-zinc-300 text-base">
        Read the{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          README.md
        </code>{" "}
        file to get started.
      </p>
    </header>
  );
}

function ThirdwebResources() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center">
      <ArticleCard
        title="thirdweb SDK Docs"
        href="https://portal.thirdweb.com/typescript/v5"
        description="thirdweb TypeScript SDK documentation"
      />

      <ArticleCard
        title="Components and Hooks"
        href="https://portal.thirdweb.com/typescript/v5/react"
        description="Learn about the thirdweb React components and hooks in thirdweb SDK"
      />

      <ArticleCard
        title="thirdweb Dashboard"
        href="https://thirdweb.com/dashboard"
        description="Deploy, configure, and manage your smart contracts from the dashboard."
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
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}
