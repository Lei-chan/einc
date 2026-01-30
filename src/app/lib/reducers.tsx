import { TYPE_ACTION_PAGINATION } from "./config/type";

export function paginationReducer(
  state: number,
  action: TYPE_ACTION_PAGINATION,
) {
  if (action === "add") return state + 1;

  return state - 1;
}

export function checkboxReducer(state: boolean, action: boolean | "toggle") {
  if (action === "toggle") return !state;

  return action;
}
