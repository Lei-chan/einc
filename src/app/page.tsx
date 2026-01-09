import Image from "next/image";

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <div className="relative w-full h-[14%] bg-gradient-to-r from-yellow-200 to-orange-300 flex flex-row items-center">
        <Image
          src="/einc-logo.PNG"
          alt="einc logo"
          width={500}
          height={250}
          className="w-auto h-full aspect-[1/0.5] object-cover"
        />
        <div className="absolute w-[60%] h-fit flex flex-row text-base gap-3 right-4 text-red-600 text-center items-center leading-tight justify-end">
          <button className="bg-[url('/icons/language.svg')] w-[15%] aspect-square bg-center bg-contain bg-no-repeat"></button>
          <p>Login</p>
          <p>Sign up</p>
        </div>
      </div>
    </div>
  );
}
