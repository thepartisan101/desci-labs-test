
import React from 'react';
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import { ModeToggle } from './modeToggle'
import { Settings } from "lucide-react"
import { ConnectButton } from '@rainbow-me/rainbowkit';



interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const router = useRouter();

  const handleLogout = () => {
    onLogout();
    router.push('/');
  };

  return (
    <div className="flex items-center justify-between py-3 px-5">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center rounded-full w-12 h-12 p-3  ">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
            src="/logo.svg"
            alt="Desci Lab Logo"
            width={33}
            height={20}
            priority
          />
          </div>
        <h1 className="scroll-m-20 text-xl font-semibold tracking-tight">DeSci Labs</h1>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <ConnectButton showBalance={false} />
      </div>
    </div>
  );
};

export default Navbar;