import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/einc-logo.PNG"
      alt="einc logo"
      width={500}
      height={250}
      className="w-[30%] h-auto aspect-[1/0.5] object-contain left-3 absolute"
    />
  );
}
