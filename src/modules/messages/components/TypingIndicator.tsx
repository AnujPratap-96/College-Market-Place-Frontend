export interface TypingIndicatorProps {
  name?: string;
}

export const TypingIndicator = ({ name }: TypingIndicatorProps) => {
  const displayName = name || 'User';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/70 backdrop-blur-xs border border-border/50 text-xs text-muted-foreground w-fit shadow-xs">
      <div className="flex items-center gap-1">
        <span
          className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: '-0.32s' }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: '-0.16s' }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
        />
      </div>
      <span>{displayName} is typing...</span>
    </div>
  );
};

export default TypingIndicator;
