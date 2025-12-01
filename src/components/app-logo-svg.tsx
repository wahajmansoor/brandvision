export function AppLogoSvg({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="100" height="100" rx="24" fill="hsl(var(--primary))" />
            <path
                d="M50.5196 28V43.8344C50.5196 46.1203 52.015 48.1462 54.1292 49.0344L69.9996 56.125V43.875L50.5196 28Z"
                fill="hsl(var(--primary-foreground))"
                style={{ mixBlendMode: 'plus-lighter' }}
                opacity="0.5"
            />
            <path
                d="M31 56.125L50.5204 72V56.1656C50.5204 53.8797 49.025 51.8538 46.9108 50.9656L31 56.125Z"
                fill="hsl(var(--primary-foreground))"
                style={{ mixBlendMode: 'plus-lighter' }}
                opacity="0.5"
            />
            <path
                d="M31 43.875V56.125L46.9108 50.9656C49.025 51.8538 50.5204 53.8797 50.5204 56.1656V72L69.9996 56.125V43.875L54.1292 49.0344C52.015 48.1462 50.5196 46.1203 50.5196 43.8344V28L31 43.875Z"
                fill="hsl(var(--primary-foreground))"
            />
        </svg>
    );
}
