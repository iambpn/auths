type Props = {
  header: string;
  description: string;
};

export default function SettingHeader(props: Props) {
  return (
    <>
      <h2 className='text-2xl font-bold tracking-tight'>{props.header}</h2>
      <p className='text-muted-foreground'>{props.description}</p>
    </>
  );
}
