export default function ErrorMessageInput({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return <p className="text-red-500 text-sm">{errorMessage}</p>;
}
