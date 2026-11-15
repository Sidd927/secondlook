import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px] translate-y-[3px]" fill="none">
        <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="2" />
        <path d="M15 15l5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M7.2 10.2l1.9 1.9 3.8-4" stroke="var(--stop)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="serif text-[22px] leading-none">
        Second<span className="italic">Look</span>
      </span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b hairline bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75 sticky top-0 z-30">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="SecondLook home" className="text-ink">
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-[14px]">
          <Link href="/#check" className="rounded-md px-3 py-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink">
            Check a listing
          </Link>
          <Link href="/batch" className="hidden rounded-md px-3 py-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink sm:inline-block">
            Batch check
          </Link>
          <Link href="/how-it-works" className="rounded-md px-3 py-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink">
            How it works
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t hairline">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-[13px] text-muted md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <Wordmark className="text-ink" />
          <p className="max-w-sm leading-relaxed">
            An independent tool built for IceHacks 2026. Not affiliated with or endorsed by the U.S. Consumer Product Safety
            Commission. SecondLook is a screening aid, not a guarantee that a product is safe.
          </p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Data</p>
          <ul className="space-y-1.5">
            <li>
              <a className="underline decoration-rule-strong underline-offset-4 hover:text-ink" href="https://www.saferproducts.gov/RestWebServices">
                CPSC Recalls API
              </a>
            </li>
            <li>
              <a className="underline decoration-rule-strong underline-offset-4 hover:text-ink" href="https://www.cpsc.gov/Recalls">
                cpsc.gov/Recalls
              </a>
            </li>
            <li>
              <a className="underline decoration-rule-strong underline-offset-4 hover:text-ink" href="https://www.saferproducts.gov/">
                Report an unsafe product
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Project</p>
          <ul className="space-y-1.5">
            <li>
              <Link className="underline decoration-rule-strong underline-offset-4 hover:text-ink" href="/how-it-works">
                Methodology &amp; limits
              </Link>
            </li>
            <li>
              <a className="underline decoration-rule-strong underline-offset-4 hover:text-ink" href="https://github.com/Sidd927/secondlook">
                Source on GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
