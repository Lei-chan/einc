import { getLanguageFromPathname } from "@/app/lib/helper";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LinkPrivacyPolicy({
  textSizeClassName,
}: {
  textSizeClassName: string;
}) {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <Link
      href={`/${language}/privacy-policy`}
      className={`underline text-purple-700 hover:text-purple-500 ${textSizeClassName}`}
    >
      {language === "en" ? "Privacy Policy" : "プライバシーポリシー"}
    </Link>
  );
}
