import Head from "next/head";
import Image from "next/image";
import Layout from './components/layout'
import { Inter } from "@next/font/google";
import { useState } from "react";
import axios from "axios";
import { BasicIpfsData } from "./api/ipfs";
import { Button } from "./components/ui/button";
import { NoteForm } from "./components/noteForm";
import { RefreshCw } from "lucide-react";
import { useAccount } from 'wagmi'


const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount()

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BasicIpfsData[] | null>(null);

  const [note, setNote] = useState<BasicIpfsData | null>(null);
  const [txt, setTxt] = useState("");

  const handleLoad = async () => {
    setLoading(true);
    const { data } = await axios.get<BasicIpfsData[]>("/api/ipfs");
    setResult(data);
    setLoading(false);
};


  // avoiding ternary operators for classes
  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <Head>
        <title>IPFS Notes</title>
        <meta name="description" content="IPFS Notes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout onLogout={() => console.log('Logging out...')}>
        <div className="flex flex-col gap-3 items-center mx-auto">
          <h1 className="scroll-m-20 text-xl font-semibold tracking-tight lg:text-3xl">
            Your IPFS Notes
          </h1>
          {address ? 
            <div className="flex flex-col sm:flex-row gap-2">
              <NoteForm handleLoad={handleLoad} />
              <div className="w-2/3 flex flex-col gap-2">
                {result ? 
                  <Button
                    onClick={handleLoad}
                    size="icon"
                    variant="outline"
                    className={classNames(
                      "hover:bg-white text-white hover:text-black rounded-md p-2 drop-shadow-md w-32",
                      loading ? "animate-pulse" : ""
                      )}
                      >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {loading ? "Loading..." : "Show Notes"}
                  </Button>
                  : null}
                {result?.length ? (
                  result.map((note, i) => (
                    <div key={i} className="flex flex-col hover:border-2 hover:drop-shadow-sm rounded-sm p-3">
                      <span>{note.content}</span>
                      <span className="text-sm text-muted-foreground">CID: {(note.cid).substring(0, 30) + "..."}</span>
                    </div>
                  ))
                ) : (
                  <span>No notes found</span>
                )}
              </div>
            </div>
            :
            <h3>Please connect your wallet to access</h3>
          }
        </div>
      </Layout>
    </>
  );
}
