import { TYPE_ACTION_PAGINATION } from "../lib/config/type";

export default function ButtonPagination({
  numberOfPages,
  curPage,
  onClickPagination,
}: {
  numberOfPages: number;
  curPage: number;
  onClickPagination: (type: TYPE_ACTION_PAGINATION) => void;
}) {
  const btnClassName =
    "w-9 absolute bg-gradient-to-l from-orange-700 to-orange-700/80 p-1 rounded-[50%] text-sm";
  return (
    <div className="flex-[0.5] text-white">
      {curPage > 1 && (
        <button
          type="button"
          className={`${btnClassName} left-7`}
          onClick={() => onClickPagination("reduce")}
        >
          ←{curPage - 1}
        </button>
      )}
      {numberOfPages > curPage && (
        <button
          type="button"
          className={`${btnClassName} right-7`}
          onClick={() => onClickPagination("add")}
        >
          {curPage + 1}→
        </button>
      )}
    </div>
  );
}
