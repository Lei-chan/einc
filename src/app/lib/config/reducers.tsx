import { TYPE_ACTION_PAGINATION } from "./type";

export function paginationReducer(
  state: number,
  action: TYPE_ACTION_PAGINATION,
) {
  if (action === "add") return state + 1;

  return state - 1;
}
