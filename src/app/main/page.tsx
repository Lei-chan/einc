import Logo from "../Components/Logo";
import Link from "next/link";
import FolderPagination from "../Components/FolderPagination";

export default function Main() {
  return (
    <div className="relative w-screen h-screen flex flex-col">
      <Top />
      <FolderPagination type="main" />
    </div>
  );
}

function Top() {
  const btnClassName = "h-full bg-top bg-no-repeat text-xs";

  return (
    <div className="relative w-full flex flex-row items-center flex-1">
      <Logo />
      <div className="absolute w-[55%] h-[70%] flex flex-row items-center justify-center gap-[6%] right-2 text-center">
        <Link
          href="/main/dictionary"
          className={`${btnClassName} w-[30%] bg-[url('/icons/dictionary.svg')] bg-[length:60%] pt-[20%]`}
        >
          Dictionary
        </Link>
        <Link
          href="/main/add"
          className={`${btnClassName} w-[20%] bg-[url('/icons/plus.svg')] bg-[length:65%] mt-[4%] pt-[18%]`}
        >
          Add
        </Link>
        <Link
          href="/account"
          className={`${btnClassName} w-[28%] aspect-square bg-[url('/icons/account.svg')] bg-[length:63%] mt-[1%] pt-[20%]`}
        >
          Account
        </Link>
      </div>
    </div>
  );
}
