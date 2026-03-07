export default function ErrorMessageInput({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return (
    <p className="w-[12rem] text-left  text-red-500 text-sm ">
      {errorMessage}
      {/* {errorMessage.map((msg, i) => (
        <p key={i} className=" text-red-500 text-sm ">
          {msg}
        </p>
      ))} */}
    </p>
  );
}
