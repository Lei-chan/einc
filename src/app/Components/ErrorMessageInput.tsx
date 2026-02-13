export default function ErrorMessageInput({
  errorMessage,
}: {
  errorMessage: string[];
}) {
  return (
    <div className="w-[12rem] text-left">
      {errorMessage.map((msg, i) => (
        <p key={i} className=" text-red-500 text-sm ">
          {msg}
        </p>
      ))}
    </div>
  );
}
