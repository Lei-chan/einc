import { getLanguageFromPathname } from "@/app/lib/helper";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LinkPrivacyPolicy() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <Link
      href={`/${language}/privacy-policy`}
      className="text-sm underline text-purple-700"
    >
      {language === "en" ? "Privacy Policy" : "プライバシーポリシー"}
    </Link>
  );
}
