import { ThemeAwareLogo } from './theme-aware-logo';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <ThemeAwareLogo className="w-10 h-10" />
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight">Brand Vision</span>
        <span className="text-xs text-muted-foreground leading-tight">In Seconds</span>
      </div>
    </div>
  );
}
