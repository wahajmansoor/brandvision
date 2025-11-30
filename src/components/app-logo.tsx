import { Zap } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
        <Zap className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight">Brand Vision</span>
        <span className="text-xs text-muted-foreground leading-tight">Tool</span>
      </div>
    </div>
  );
}
