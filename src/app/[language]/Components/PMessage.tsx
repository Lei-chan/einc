// type
import { MessageType } from "../../lib/config/types/others";

export default function PMessage({
  type,
  message,
}: {
  type: MessageType;
  message: string;
}) {
  return (
    <p
      className={`w-[18rem] text-center shadow-md shadow-black/10  leading-tight text-sm lg:text-base 2xl:text-lg text-white py-1 px-2 rounded z-10 ${type === "pending" ? "bg-purple-400" : type === "error" ? "bg-red-500" : "bg-green-400"}`}
    >
      {message}
    </p>
  );
}
