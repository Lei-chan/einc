import LinkAddVocab from "@/app/Components/LinkAddVocab";
import Logo from "@/app/Components/Logo";

export default async function Folder(props: PageProps<"/folder/[id]">) {
  const { id } = await props.params;

  return (
    <div className="w-screen h-fit flex flex-col items-center gap-12">
      <Top />
      <ContentContainer />
      <Graph />
    </div>
  );
}

function Top() {
  return (
    <div className="relative w-full h-14 flex flex-row items-center mt-1">
      <Logo />
      <div className="absolute w-[55%] h-[70%] flex flex-row items-center justify-end right-4 text-center">
        <LinkAddVocab />
      </div>
    </div>
  );
}

function ContentContainer() {
  return (
    <div className="w-[90%] h-[65vh] grid grid-cols-2 row-span-2 justify-items-center place-content-evenly">
      <ButtonContent name="List" />
      <ButtonContent name="Flashcard" />
      <ButtonContent name="Quiz" />
      <ButtonContent name="Journal" />
    </div>
  );
}

function ButtonContent({ name }: { name: string }) {
  return (
    <button className="w-[120px] aspect-square text-center bg-gradient-to-l from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 rounded-md text-white text-xl font-semibold tracking-widest shadow-md shadow-black/20">
      {name}
    </button>
  );
}

function Graph() {
  return (
    <div className="w-full h-60 bg-gradient-to-tl from-red-600/70 to-red-400/70 p-2">
      <h2 className="text-xl font-medium text-white">Your Progress</h2>
    </div>
  );
}
