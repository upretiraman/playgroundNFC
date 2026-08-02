function CapArt() {
  return (
    <div className="relative flex h-36 w-36 items-end justify-center sm:h-44 sm:w-44">
      <div className="absolute top-0 h-2.5 w-2.5 rounded-full bg-gold" />
      <div className="absolute bottom-7 h-24 w-28 rounded-t-full bg-crimson sm:h-28 sm:w-32" />
      <div className="absolute bottom-16 flex h-9 w-9 items-center justify-center rounded-full bg-cream ring-2 ring-crimson-dark sm:h-10 sm:w-10">
        <span className="font-display text-[9px] tracking-wide text-crimson-dark">
          NFC
        </span>
      </div>
      <div className="absolute bottom-0 h-5 w-36 rounded-[50%] bg-charcoal sm:w-44" />
    </div>
  );
}

function ToteArt() {
  return (
    <div className="relative flex h-36 w-36 items-end justify-center sm:h-44 sm:w-44">
      <div className="absolute top-1 h-10 w-7 -translate-x-9 rounded-t-full border-4 border-b-0 border-charcoal sm:h-12 sm:-translate-x-10" />
      <div className="absolute top-1 h-10 w-7 translate-x-9 rounded-t-full border-4 border-b-0 border-charcoal sm:h-12 sm:translate-x-10" />
      <div className="relative z-10 flex h-28 w-32 flex-col items-center justify-center rounded-t-md rounded-b-2xl bg-cream ring-2 ring-charcoal-soft sm:h-32 sm:w-36">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-crimson sm:h-12 sm:w-12">
          <span className="font-display text-[10px] tracking-wide text-cream">
            NFC
          </span>
        </div>
      </div>
    </div>
  );
}

function TshirtArt() {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
      <div className="relative flex h-28 w-32 flex-col items-center rounded-b-xl rounded-t-md bg-cream ring-2 ring-charcoal-soft sm:h-32 sm:w-36">
        <div className="absolute -left-4 top-1 h-8 w-6 -rotate-12 rounded-md bg-cream ring-2 ring-charcoal-soft sm:-left-5 sm:h-9" />
        <div className="absolute -right-4 top-1 h-8 w-6 rotate-12 rounded-md bg-cream ring-2 ring-charcoal-soft sm:-right-5 sm:h-9" />
        <div className="mt-3 h-6 w-10 rounded-b-full ring-2 ring-charcoal-soft sm:mt-4" />
        <div className="mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-crimson sm:h-10 sm:w-10">
          <span className="font-display text-[9px] tracking-wide text-cream">
            NFC
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProductArt({
  variant,
}: {
  variant: "cap" | "tote" | "tshirt" | null;
}) {
  return (
    <div className="flex aspect-square items-center justify-center bg-cream-dark">
      {variant === "cap" && <CapArt />}
      {variant === "tote" && <ToteArt />}
      {(variant === "tshirt" || variant === null) && <TshirtArt />}
    </div>
  );
}
