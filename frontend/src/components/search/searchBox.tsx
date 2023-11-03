import { useIsScrolled } from "@/hooks/isScrolled";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { Input } from "../ui/input";

export type SearchBoxItem = {
  id: string;
  value: React.ReactNode;
};

type Props = {
  getSearchKeyword: (keyword: string) => void;
  onScrollBottom: () => void;
  headingText?: string;
  searchPlaceholder?: string;
  searchItems: SearchBoxItem[];
  selectedItems: SearchBoxItem[];
  onItemSelect: (item: SearchBoxItem, isSelected: boolean) => void;
};

export function SearchBox(props: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const scrolled = useIsScrolled();

  return (
    <>
      <div className='mb-1'>
        <Input
          placeholder={props.searchPlaceholder ?? "Search ..."}
          onChange={(e) => {
            props.getSearchKeyword(e.currentTarget.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
      </div>
      <div className='relative'>
        <div className='absolute w-full z-10'>
          {isFocused && (
            <Command className='rounded-lg border shadow-md'>
              <CommandList
                onScroll={(e) => {
                  if (scrolled.isScrolledToBottom(e)) {
                    props.onScrollBottom();
                  }
                }}
              >
                <CommandGroup heading={props.headingText ?? "Search Result"}>
                  {props.searchItems.map((item) => (
                    <CommandItem onSelect={() => props.onItemSelect(item, true)} key={item.id} value={item.id}>
                      {item.value}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandEmpty>No results found.</CommandEmpty>
              </CommandList>
            </Command>
          )}
        </div>
      </div>
      <div>
        <Command>
          <CommandList>
            <CommandGroup heading={"Selected Items :"}>
              {props.selectedItems.map((item) => (
                <CommandItem onSelect={() => props.onItemSelect(item, false)} key={item.id + "selected"} value={item.id + "selected"}>
                  {item.value}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </>
  );
}
