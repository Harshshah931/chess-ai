'use client';

import Image from 'next/image';

interface AppLogoProps {
  size?: number;
  className?: string;
}

export default function AppLogo({ size = 32, className }: AppLogoProps) {
  return (
    <Image
      src="/assets/images/app_logo.png"
      alt="ChessAI Logo"
      width={size}
      height={size}
      className={className}
    />
  );
}