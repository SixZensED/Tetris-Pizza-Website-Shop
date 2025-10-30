import Image from "next/image";
import Link from "next/link";

const SECTION_MAX_WIDTH = "max-w-[1440px]";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Orders", href: "/order" },
  { label: "About Us", href: "#about" },
  { label: "Privacy Policy", href: "#privacy" },
] as const;

export function Footer() {
  return (
    <footer className="bg-[#101010] text-white">
      <div className={`mx-auto w-full ${SECTION_MAX_WIDTH} px-6 py-10`}>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative h-12 w-12">
            <Image
              src="/images/Logo.png"
              alt="Tetris Pizza logo"
              fill
              sizes="48px"
              className="object-contain [transform:scale(1.4)] [transform-origin:center]"
              priority
            />
          </div>
          <p className="text-sm text-[#f3f3f3]">
            Open in <span className="font-semibold text-white">10:00 am - 21:00 pm</span>
          </p>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#d3d3d3]">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="transition-colors duration-150 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-xs text-[#a3a3a3]">(c) 2025 Tetris Pizza&rsquo;s All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
