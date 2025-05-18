"use client";

import Image from "next/image";
import Link from "next/link";
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
  isAddress,
} from "thirdweb";
import rbarbitrumIcon from "@public/rbarbitrum.svg";
import { client } from "./client";
import QRCode from "qrcode.react";
import QrScanner from "qr-scanner";
import { useState, useEffect, useRef } from "react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
// Define la cadena arbitrum que quieres usar
const arbitrumMainnet = defineChain(421614);
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
// Dirección del token
const TOKEN_ADDRESS = "0x670984EC30A4C1b03B9f31199F8cbA233817506C";

export default function Home() {
  const account = useActiveAccount();
  const contract = getContract({
    client,
    chain: arbitrumMainnet,
    address: TOKEN_ADDRESS,
  });

  const { data: balance, isLoading: isLoadingBalance } = useWalletBalance({
    client,
    chain: arbitrumMainnet,
    address: account?.address,
    tokenAddress: TOKEN_ADDRESS,
  });
  const formattedBalance = balance ? toEther(balance.value) : "0";

  const {
    mutate: sendTokenTransaction,
    isPending: isSendingToken,
    error: transactionError,
  } = useSendTransaction();

  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Check for available cameras
  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((device) => device.kind === "videoinput");
      if (!hasCamera) {
        throw new Error("No se encontraron cámaras en este dispositivo.");
      }
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : "Error al verificar cámaras.");
      setIsScanning(false);
    }
  };

  // Initialize and clean up QR scanner
  useEffect(() => {
    if (isScanning && videoRef.current) {
      checkCameraAvailability().then(() => {
        if (!videoRef.current) return; // Additional safety check
        qrScannerRef.current = new QrScanner(videoRef.current as HTMLVideoElement, (result) => {
          if (isAddress(result.data)) {
            setScannedAddress(result.data);
            setIsScanning(false);
          } else {
            alert("La dirección escaneada no es válida.");
          }
        }, {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
        });

        qrScannerRef.current.start().catch((err) => {
          console.error("Error iniciando el escáner:", err);
          setCameraError(
            err.message.includes("Camera not found")
              ? "No se encontró una cámara. Conecta una cámara o usa un dispositivo con cámara."
              : "Error al iniciar el escáner. Asegúrate de permitir el acceso a la cámara."
          );
          setIsScanning(false);
        });
      });
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [isScanning]);

  const handleSendToken = async (amount: string) => {
    if (!account || !contract || !client) {
      alert("Por favor, conecta tu billetera y asegúrate de que el cliente esté inicializado.");
      return;
    }
    if (!scannedAddress || !isAddress(scannedAddress)) {
      alert("Por favor, escanea una dirección válida antes de enviar tokens.");
      return;
    }

    try {
      const tx = prepareContractCall({
        contract,
        method: "function transfer(address to, uint256 value) returns (bool)",
        params: [scannedAddress, toWei(amount)],
      });
      await sendTokenTransaction(tx);
      alert(`¡Transacción de ${amount} $RB iniciada! Revisa tu billetera para aprobar.`);
    } catch (err) {
      console.error("Error al preparar o enviar la transacción de token:", err);
      alert(`Error al enviar ${amount} $RB: ${err instanceof Error ? err.message : "Error desconocido"}`);
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
                Saldo: {parseFloat(formattedBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $RB
              </p>
            )
          ) : (
            <p className="text-zinc-300">Conecta tu wallet para ver el saldo $RB</p>
          )}
        </div>

        {/* Mostrar el QR y la dirección de la cuenta */}
        {account && (
          <div className="flex flex-col items-center mb-10">
            <p className="text-zinc-100 text-lg mb-4">Tu dirección:</p>
            <p className="text-zinc-300 text-sm mb-4 break-all">{account.address}</p>
            {QRCode ? (
              <div className="bg-white p-2 rounded-lg">
                <QRCode
                  value={account.address}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="Q"
                  includeMargin={false}
                />
              </div>
            ) : (
              <p className="text-red-500">Error: No se pudo cargar el componente QR</p>
            )}
            <p className="text-zinc-400 text-sm mt-4">
              Escanea este QR para compartir tu dirección y recibir tokens.
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(account.address)}
              className="text-blue-400 hover:text-blue-300 underline text-sm mt-2"
            >
              Copiar dirección
            </button>
          </div>
        )}

        {/* Botón para escanear QR */}
        {account && (
          <div className="flex flex-col items-center mb-10">
            <button
              onClick={() => {
                setCameraError(null);
                setIsScanning(!isScanning);
              }}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 mb-4"
            >
              {isScanning ? "Cerrar escáner" : "Escanear dirección"}
            </button>
            {isScanning && (
              <div className="w-[300px] h-[300px] border border-zinc-800 rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full" />
              </div>
            )}
            {cameraError && (
              <p className="text-red-500 text-sm mt-4">{cameraError}</p>
            )}
            {scannedAddress && (
              <div className="flex flex-col items-center mt-4">
                <p className="text-zinc-100 text-sm">
                  Dirección escaneada: <span className="break-all">{scannedAddress}</span>
                </p>
                <button
                  onClick={() => setScannedAddress(null)}
                  className="text-blue-400 hover:text-blue-300 underline text-sm mt-2"
                >
                  Borrar dirección escaneada
                </button>
              </div>
            )}
          </div>
        )}

        {/* Botones para enviar diferentes cantidades de tokens */}
        {account && (
          <div className="flex flex-wrap justify-center gap-4 mb-20">
            {["0.1", "0.2", "0.3", "0.5", "1"].map((amount) => (
              <button
                key={amount}
                onClick={() => handleSendToken(amount)}
                disabled={isSendingToken || !scannedAddress}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSendingToken ? `Enviando ${amount} $RB...` : `Envía ${amount} $RB`}
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
              wallets={wallets}
            accountAbstraction={{ 
              chain: arbitrumMainnet, 
              sponsorGas: true }}
            connectButton={{ label: "Crea tu cuenta/Login" }}
            appMetadata={{
              name: "Royal Bunker Arbitrum App",
              url: "https://mexi.wtf",
            }}
          />
        </div>

        <ThirdwebResources />
      </div>
    </main>
  );
}

// Componentes Header, ThirdwebResources, ArticleCard
function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={rbarbitrumIcon}
        alt="Royal Bunker Arbitrum Icon"
        className="size-[200px] md:size-[200px]"
        style={{
          filter: "drop-shadow(0px 0px 24x #f28500a8)",
        }}
      />
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        BandaWeb3
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-blue-500">Arbitrum</span>
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
        title="Historia de Arbitrum"
        href="https://arbitrum.io/"
        description="Conoce más sobre Arbitrum"
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
      href={`${props.href}?utm_source=next-template`}
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