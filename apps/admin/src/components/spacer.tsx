function Spacer({ height = 4 }: { height?: number }) {
  return <div className={`h-${height} w-full`} />;
}

export default Spacer;
