export default function ButtonPlus({
  onClickButton,
}: {
  onClickButton: () => void;
}) {
  return (
    <button
      type="button"
      className="h-10 aspect-square text-3xl text-white bg-red-400 rounded-[50%] pb-1 shadow-sm shadow-black/30"
      onClick={onClickButton}
    >
      +
    </button>
  );
}
