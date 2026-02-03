import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import users from "../ModelsDev/User";
import { TYPE_DECODED_GOOGLE_CREDENTIAL } from "../lib/config/type";
import { redirect, RedirectType } from "next/navigation";

export default function ViaGoogle({
  typeToDisplay,
  displayError,
}: {
  typeToDisplay: "Log in" | "Sign up";
  displayError: (error: string) => void;
}) {
  const errorMessage = `${typeToDisplay} Failed. Please try this later or try another mathod.`;

  async function handleSignup(email: string) {
    try {
      const userData = {
        email,
        isGoogleConnected: true,
      };

      console.log(userData);

      // send data to server
    } catch (err) {
      throw err;
    }
  }

  async function handleLogin(email: string) {
    try {
      const user = users.find(
        (user) => user.email === email && user.isGoogleConnected,
      );
      if (!user)
        return displayError(
          "No user found! Please try different accound or different method.",
        );
    } catch (err) {
      throw err;
    }
  }

  return (
    <div className="w-full p-3 flex flex-col items-center">
      <p className="mb-3">{typeToDisplay} via Google</p>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const credential = credentialResponse.credential;

            if (!credential) {
              console.error("Error. No credential provided.");
              return displayError(errorMessage);
            }

            const userCredential: TYPE_DECODED_GOOGLE_CREDENTIAL =
              jwtDecode(credential);

            const email = userCredential.email;
            if (!email) return displayError(errorMessage);

            // I will change it by connecting to server with await
            const userData =
              typeToDisplay === "Sign up"
                ? await handleSignup(email)
                : await handleLogin(email);
          } catch (err: unknown) {
            console.error("Error", err);
            return;
          }

          // navigates to main
          redirect("/main", RedirectType.replace);
        }}
        onError={() => {
          displayError(errorMessage);
          console.error(errorMessage);
        }}
      />
    </div>
  );
}
