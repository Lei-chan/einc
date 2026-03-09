import { ActionPaginationType } from "@/app/lib/config/types/others";

export default function ButtonPagination({
  numberOfPages,
  curPage,
  showNumber,
  onClickPagination,
}: {
  numberOfPages: number;
  curPage: number;
  showNumber: boolean;
  onClickPagination: (type: ActionPaginationType) => void;
}) {
  const btnClassName =
    "absolute bg-gradient-to-l from-orange-700 to-orange-700/80 py-1 px-[6px] md:px-2 rounded-[50%] text-sm lg:text-base";
  return (
    <div className="relative w-full md:w-[90%] lg:w-[85%] xl:w-[80%] 2xl:w-[75%] flex-[0.5] text-white mb-2">
      {curPage > 1 && (
        <button
          type="button"
          className={`${btnClassName} left-4`}
          onClick={() => onClickPagination("reduce")}
        >
          ←{showNumber && curPage - 1}
        </button>
      )}
      {numberOfPages > curPage && (
        <button
          type="button"
          className={`${btnClassName} right-4`}
          onClick={() => onClickPagination("add")}
        >
          {showNumber && curPage + 1}→
        </button>
      )}
    </div>
  );
}
