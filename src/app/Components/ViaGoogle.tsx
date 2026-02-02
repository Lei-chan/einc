import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function ViaGoogle({
  typeToDisplay,
  displayError,
}: {
  typeToDisplay: "Log in" | "Sign up";
  displayError: (error: string) => void;
}) {
  const errorMessage = `${typeToDisplay} Failed. Please try this later or try another mathod.`;

  return (
    <div className="w-full p-3 flex flex-col items-center">
      <p className="mb-3">{typeToDisplay} via Google</p>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          const credential = credentialResponse.credential;

          if (!credential) {
            console.error("Error. No credential provided.");
            return displayError(errorMessage);
          }

          const userCredential = jwtDecode(credential);
          console.log(userCredential);
        }}
        onError={() => {
          displayError(errorMessage);
          console.error(errorMessage);
        }}
      />
    </div>
  );
}
