"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Logo({ topClassName }: { topClassName?: string }) {
  const pathname = usePathname();

  return (
    <Link
      href={pathname === "/" ? "/" : "/main"}
      className={`absolute w-[100px] aspect-[1/0.5] bg-[url('/einc-logo.PNG')] bg-no-repeat bg-contain bg-center left-3 ${topClassName}`}
    />
  );
}
