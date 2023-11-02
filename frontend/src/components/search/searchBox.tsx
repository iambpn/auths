import { useIsScrolled } from "@/hooks/isScrolled";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { Input } from "../ui/input";

type Props = {
  getSearchKeyword: (keyword: string) => void;
  onScrollBottom: () => void;
  headingText?: string;
  items: { id: string; value: React.ReactNode }[];
};

export function SearchBox(props: Props) {
  const scrolled = useIsScrolled();

  return (
    <>
      <div className='mb-1'>
        <Input
          placeholder='Type a command or search...'
          onChange={(e) => {
            props.getSearchKeyword(e.currentTarget.value);
          }}
        />
      </div>
      <div>
        <Command className='rounded-lg border shadow-md'>
          <CommandList
            onScroll={(e) => {
              if (scrolled.isScrolledToBottom(e)) {
                props.onScrollBottom();
              }
            }}
          >
            <CommandEmpty>No results found.</CommandEmpty>
            {props.items.length > 0 && (
              <CommandGroup heading={props.headingText ?? ""}>
                {props.items.map((item) => (
                  <CommandItem>{item.value}</CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
    </>
  );
}
