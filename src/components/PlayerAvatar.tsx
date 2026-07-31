function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PlayerAvatar({
  name,
  isCaptain = false,
  className = "",
}: {
  name: string;
  isCaptain?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative flex aspect-square items-center justify-center rounded-full bg-gradient-to-br from-crimson to-crimson-dark text-cream ${
        isCaptain ? "ring-4 ring-gold" : "ring-4 ring-cream-dark"
      } ${className}`}
    >
      <span className="font-display text-3xl tracking-wide sm:text-4xl">
        {initials(name)}
      </span>
      {isCaptain && (
        <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-charcoal shadow">
          C
        </span>
      )}
    </div>
  );
}
