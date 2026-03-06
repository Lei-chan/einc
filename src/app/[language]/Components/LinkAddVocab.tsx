import Link from "next/link";

export default function LinkAddVocab({
  collectionId,
}: {
  collectionId: string;
}) {
  return (
    <Link
      href={`/add#${collectionId}`}
      className="w-[20%] h-full bg-top bg-no-repeat text-xs bg-[url('/icons/plus.svg')] bg-[length:65%] mt-[4%] pt-[18%]"
    >
      Add
    </Link>
  );
}
