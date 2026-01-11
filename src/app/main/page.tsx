import Logo from "../Components/Logo";

export default function Main() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Top />
      <FolderContainer />
      <Pagination />
    </div>
  );
}

function Top() {
  const btnClassName = "w-fit h-full bg-top bg-no-repeat text-xs";

  return (
    <div className="relative w-full flex flex-row items-center flex-1">
      <Logo />
      <div className="absolute w-1/3 h-[70%] flex flex-row items-center justify-center gap-4 right-3">
        <button
          type="button"
          className={`${btnClassName} bg-[url('/icons/dictionary.svg')] bg-[length:60%] pt-[30%]`}
        >
          Dictionary
        </button>
        <button
          type="button"
          className={`${btnClassName} bg-[url('/icons/plus.svg')] bg-[length:80%] pt-[20%] mt-[10%]`}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function FolderContainer() {
  return (
    <div className="w-full flex-[4.5] p-[5%]">
      <ul className="w-full h-full grid grid-cols-2 grid-rows-5 items-center justify-items-center">
        <Folder />
        <Folder />
        <Folder />
        <Folder />
        <Folder />
        <Folder />
        <Folder />
        <Folder />
        <Folder />
        <Folder />
      </ul>
    </div>
  );
}

function Folder() {
  return (
    <li className="w-[90%] h-[85%] bg-gradient-to-l from-red-500 to-orange-400 rounded text-white flex flex-col justify-center text-center">
      Collection 1
    </li>
  );
}

function Pagination() {
  return <div className="flex-[0.5]"></div>;
}
