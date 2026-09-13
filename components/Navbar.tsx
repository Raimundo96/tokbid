import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-base-line bg-base-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-4">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          <span data-text="TokBid" className="glitch-text">
            Tok<span className="text-neon-pink">Bid</span>
          </span>{" "}
          <span className="text-gold">👑</span>
        </Link>
      </div>
    </header>
  );
}
