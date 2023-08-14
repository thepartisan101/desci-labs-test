import { useState, useEffect} from 'react';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
  } from "./ui/command"  
import { BasicIpfsData } from "../api/ipfs";

type CommandMenuProps = {
    ipfsDataList: BasicIpfsData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };

const CommandMenu: React.FC<CommandMenuProps> = ({ ipfsDataList, open, onOpenChange }) => {
  
    return (
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Your notes">
            {ipfsDataList.map((data, index) => (
                <CommandItem key={data.cid}>
                {data.content}
                </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    )
};
  
export default CommandMenu;


