"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import royalbunkerIcon from "@public/royalbunker.svg";
import { client } from "./client";

// Define la cadena Mantle que quieres usar
const mantleMainnet = defineChain(5000); // <--- DEFINE MANTLE MAINNET

export default function Home() {
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

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
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={royalbunkerIcon}
        alt=""
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
            target="_blank" // Abre el enlace en una nueva pestaña
            rel="noopener noreferrer" // Buena práctica de seguridad para target="_blank"
            className="text-blue-400 hover:text-blue-300 underline" // Estilo para el enlace
            >FAQ
          </a>
        </code>
        {" "}
        si tienes alguna duda.
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
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}