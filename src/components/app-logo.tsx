import Image from 'next/image';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo.png" alt="Brand Vision In Seconds Logo" width={36} height={36} />
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight">Brand Vision</span>
        <span className="text-xs text-muted-foreground leading-tight">In Seconds</span>
      </div>
    </div>
  );
}
