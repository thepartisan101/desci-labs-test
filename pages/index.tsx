import Head from "next/head";
import Image from "next/image";
import Layout from './components/layout'
import { Inter } from "@next/font/google";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BasicIpfsData } from "./api/ipfs";
import { Button } from "./components/ui/button";
import { NoteForm } from "./components/noteForm";
import { RefreshCw } from "lucide-react";
import { useAccount } from 'wagmi'
import CommandMenu from "./components/commandMenu";
import Animation from "./components/animation";


const inter = Inter({ subsets: ["latin"] });

// Type definitions
type RefreshButtonProps = {
  handleLoad: () => void;
  loading: boolean;
};

type NoteProps = {
  note: BasicIpfsData;
};

type NotesListProps = {
  result: BasicIpfsData[] | null;
  handleLoad: () => void;
};

export default function Home() {
  const { address } = useAccount()

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BasicIpfsData[] | null>(null);
  // Declare state for note search dialog
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLoad = useCallback(async () => {
    setLoading(true);
    axios.get<BasicIpfsData[]>(`/api/ipfs?address=${address}`)
      .then(response => {
        const data = response.data;
        setResult(data);
        console.log(data);
        console.log("Address used for note retrieval:", address);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data from /api/ipfs:", error);
        setLoading(false);
      });
  }, [address]);
  

  useEffect(() => {
    console.log("Current address:", address);
    if (address !== null && address !== undefined) {
      handleLoad();
    }
  }, [address, handleLoad]);  


  // avoiding ternary operators for classes
  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }


  const RefreshButton: React.FC<RefreshButtonProps> = ({ handleLoad, loading }) => (
    <Button
      onClick={handleLoad}
      size="icon"
      variant="outline"
      className={classNames(
        "dark:hover:bg-white bg-black hover:bg-gray-800 text-white hover:text-white dark:hover:text-black rounded-md p-2 drop-shadow-md w-32",
        loading ? "animate-pulse" : ""
      )}
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      {loading ? "Loading..." : "Show Notes"}
    </Button>
  );

  const Note: React.FC<NoteProps> = ({ note }) => (
    <div className="flex flex-col dark:hover:bg-slate-800 hover:bg-slate-300 rounded-sm p-3">
      <span>{note.content}</span>
      <span className="text-sm text-muted-foreground">
        CID: {note.cid ? note.cid.substring(0, 30) + "..." : "N/A"}
      </span>
    </div>
  );

  const NotesList: React.FC<NotesListProps> = ({ result, handleLoad }) => (
    <div className="w-2/3 flex flex-col gap-2 max-h-[50vh] ">
      {result && <RefreshButton handleLoad={handleLoad} loading={loading} />}
      <div className="overflow-y-auto">
        {result?.length ? (
          result.map((note, i) => <Note key={i} note={note} />)
        ) : (
          <span>No notes found</span>
        )}
      </div>
    </div>
  );

  
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
          <h1 className="scroll-m-20 text-xl font-semibold tracking-tight lg:text-3xl mb-4">
            {address ? "Your IPFS Notes" : "Welcome to DeSciLabs Notes"}
          </h1>
          {address && result && (
            <div className="mb-3">
              <p className="text-sm text-cyan-600 dark:text-cyan-400">
                Press{" "}
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-black dark:text-white opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
                to search your notes
              </p>
              <CommandMenu ipfsDataList={result} open={open} onOpenChange={setOpen} />
            </div>
          )}
          {address ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <NoteForm handleLoad={handleLoad} />
              <NotesList result={result} handleLoad={handleLoad} />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center">
              <h3>Please connect your wallet to access</h3>
              <Animation />
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
