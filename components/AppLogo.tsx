import React from 'react';
import { Box, MoveRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

const AppLogo: React.FC<AppLogoProps> = ({ className, showText = true }) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-2">
        <div className="relative">
          {/* Recreating the horse/speed feel with icons */}
          <div className="bg-primary p-2 rounded-lg text-white">
            <Box size={32} />
          </div>
          <div className="absolute -top-1 -right-1 bg-secondary rounded-full p-1 text-white border-2 border-white">
             <MoveRight size={12} className="animate-pulse" />
          </div>
        </div>
        {showText && (
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-primary leading-none">
              STALLIONEX
            </h1>
            <div className="flex items-center gap-1">
              <span className="h-[1px] flex-1 bg-primary/30"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-secondary uppercase">
                Courier
              </span>
              <span className="h-[1px] flex-1 bg-primary/30"></span>
            </div>
          </div>
        )}
      </div>
      {showText && (
        <p className="mt-1 text-[8px] italic text-secondary/70 font-medium">
          Unleashing Speed in Every Delivery
        </p>
      )}
    </div>
  );
};

export default AppLogo;
