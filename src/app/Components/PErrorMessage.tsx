export default function PErrorMessage({ error }: { error: string }) {
  return (
    <p className="text-sm text-white py-1 px-2 rounded bg-red-500">{error}</p>
  );
}
