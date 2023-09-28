type Props = {
  children: React.ReactNode;
};

export function Layout(props: Props) {
  return (
    <div className='container flex'>
      <div className='border w-1/3'>navbar</div>
      <div className='border w-2/3'>{props.children}</div>
    </div>
  );
}
