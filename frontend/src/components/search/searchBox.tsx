import { useIsScrolled } from "@/hooks/isScrolled";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { Input } from "../ui/input";
import { useState } from "react";

type Props = {
  getSearchKeyword: (keyword: string) => void;
  onScrollBottom: () => void;
  headingText?: string;
  items: { id: string; value: React.ReactNode }[];
};

export function SearchBox(props: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const scrolled = useIsScrolled();

  return (
    <>
      <div className='mb-1'>
        <Input
          placeholder='Type a command or search...'
          onChange={(e) => {
            props.getSearchKeyword(e.currentTarget.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      <div className='relative'>
        <div className='absolute w-full'>
          {isFocused && (
            <Command className='rounded-lg border shadow-md'>
              <CommandList
                onScroll={(e) => {
                  if (scrolled.isScrolledToBottom(e)) {
                    props.onScrollBottom();
                  }
                }}
              >
                <CommandGroup heading={props.items.length > 0 ? props.headingText : "No results found."}>
                  {props.items.map((item) => (
                    <CommandItem>{item.value}</CommandItem>
                  ))}
                </CommandGroup>
                <CommandEmpty>No results found.</CommandEmpty>
              </CommandList>
            </Command>
          )}
        </div>
      </div>
    </>
  );
}
