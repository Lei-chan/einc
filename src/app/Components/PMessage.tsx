import { TYPE_MESSAGE } from "../lib/config/type";

export default function PMessage({
  type,
  message,
}: {
  type: TYPE_MESSAGE;
  message: string;
}) {
  return (
    <p
      className={`w-[90%] text-center shadow-md shadow-black/10  leading-tight text-sm text-white py-1 px-2 rounded ${type === "pending" ? "bg-purple-400" : type === "error" ? "bg-red-500" : "bg-green-400"}`}
    >
      {message}
    </p>
  );
}
