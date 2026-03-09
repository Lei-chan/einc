import Dictionary from "@/app/[language]/Components/Dictionary";

export default function DictionaryPage() {
  return (
    <div className="w-full h-[100dvh]">
      <Dictionary widthClassName="w-full" heightClassName="h-full"></Dictionary>
    </div>
  );
}
