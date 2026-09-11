import { useState, useEffect } from 'react';
import { Timer, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuctionCountdownProps {
  endTime: string;
  isExtended?: boolean;
  onExpire?: () => void;
  compact?: boolean;
}

export const AuctionCountdown = ({
  endTime,
  isExtended,
  onExpire,
  compact = false,
}: AuctionCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
    isUrgent: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
    isUrgent: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endTime).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
          isUrgent: false,
        });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      const isUrgent = difference < 5 * 60 * 1000;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isEnded: false,
        isUrgent,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft.isEnded) {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground font-mono">
        Auction Ended
      </Badge>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-full ${
        timeLeft.isUrgent || isExtended
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse border border-amber-500/20'
          : 'bg-primary/10 text-primary'
      }`}>
        {isExtended ? <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> : <Timer className="w-3.5 h-3.5" />}
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isExtended && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20 w-fit">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Anti-Sniping Active (+60s Extension)</span>
        </div>
      )}

      <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${
        timeLeft.isUrgent
          ? 'bg-destructive/5 border-destructive/20 text-destructive'
          : 'bg-card border-border text-foreground'
      }`}>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Timer className="w-5 h-5" />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center flex-1">
          <div className="bg-muted/40 p-1.5 rounded-lg">
            <span className="text-xl font-bold font-mono block leading-none">{timeLeft.days}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Days</span>
          </div>
          <div className="bg-muted/40 p-1.5 rounded-lg">
            <span className="text-xl font-bold font-mono block leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Hours</span>
          </div>
          <div className="bg-muted/40 p-1.5 rounded-lg">
            <span className="text-xl font-bold font-mono block leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Mins</span>
          </div>
          <div className={`p-1.5 rounded-lg ${timeLeft.isUrgent ? 'bg-destructive/20 font-extrabold text-destructive' : 'bg-muted/40'}`}>
            <span className="text-xl font-bold font-mono block leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Secs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
