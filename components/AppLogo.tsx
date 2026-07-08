import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

const AppLogo: React.FC<AppLogoProps> = ({ className, showText = true }) => {
  return (
    <div className={cn("flex items-center", className)}>
      {showText ? (
        <Image
          src="/stallionex-full-logo.png"
          alt="Stallionex Courier"
          width={3000}
          height={1280}
          priority
          className="h-16 w-auto object-contain"
        />
      ) : (
        <Image
          src="/stallionex-icon.png"
          alt="Stallionex Courier"
          width={1260}
          height={1260}
          priority
          className="h-10 w-10 object-contain"
        />
      )}
    </div>
  );
};

export default AppLogo;
