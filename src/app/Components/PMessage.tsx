export default function PMessage({
  type,
  message,
}: {
  type: "pending" | "error" | "success";
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
