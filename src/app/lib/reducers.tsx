import { ActionPaginationType } from "./config/types/others";

export function paginationReducer(state: number, action: ActionPaginationType) {
  if (action === "add") return state + 1;

  if (action === "reduce") return state - 1;

  return 1;
}

export function checkboxReducer(state: boolean, action: boolean | "toggle") {
  if (action === "toggle") return !state;

  return action;
}
