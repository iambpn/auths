import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  link: string;
  fallBack: string;
};

export function AvatarComponent(props: Props) {
  return (
    <Avatar className="border border-gray-300">
      <AvatarImage src={props.link} alt={props.fallBack} />
      <AvatarFallback>{props.fallBack.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
