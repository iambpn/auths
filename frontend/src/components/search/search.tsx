import React from "react";
import { Command, CommandEmpty, CommandGroup, CommandList } from "../ui/command";
import { Input } from "../ui/input";

type Props = {
  searchResult: (keyword: string) => void;
};

export function SearchBox(props: Props) {
  return (
    <>
      <div className='mb-1'>
        <Input
          placeholder='Type a command or search...'
          onChange={(e) => {
            props.searchResult(e.currentTarget.value);
          }}
        />
      </div>
      <div>
        <Command className='rounded-lg border shadow-md'>
          <CommandList
            onScroll={(e) => {
              const { scrollHeight, clientHeight, scrollTop } = e.nativeEvent.;
              if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
                console.log("scrolled");
              }
            }}
          >
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading='Suggestions'>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita nobis ratione quas. Ea nemo explicabo fugit perferendis dignissimos quas facere sunt soluta! Eaque, accusamus dolores
                libero vero tempora repellat nisi.
              </p>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </>
  );
}
