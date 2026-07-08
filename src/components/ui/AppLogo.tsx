'use client';

interface AppLogoProps {
  size?: number;
  className?: string;
}

export default function AppLogo({ size = 32, className }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text y="80" fontSize="80" textAnchor="middle" x="50">♛</text>
    </svg>
  );
}