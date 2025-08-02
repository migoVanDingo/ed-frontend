import {
    createUserWithEmailAndPassword,
    getAdditionalUserInfo,
    GithubAuthProvider,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    type UserCredential,
} from "firebase/auth"
import { auth } from "../../services/firebaseConnect"
import type { IUserAuth } from "../../interface/auth";
import { UserAPI } from "../../api/UserApi";


async function handleSocialLogin(
  provider: GoogleAuthProvider | GithubAuthProvider
): Promise<any | void> {
  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    // pull out the “additionalUserInfo” via the helper
    const info = getAdditionalUserInfo(result);

    const idToken = await result.user.getIdToken();
    sessionStorage.setItem("accessToken", idToken);
    if (info?.isNewUser) {

        const {success, data, err} = await UserAPI.register();
        if (!success) {
          console.error("Error registering user:", err);
          return { success: false};
        }

        sessionStorage.setItem("accessToken", data.access_token);
        return { success: true };
    } else {
      const { success, data, err } = await UserAPI.login();
      if (!success) {
        console.error("Error logging in user:", err);
        return { success: false };
      }

      sessionStorage.setItem("accessToken", data.access_token);
      return { success, data };
    }

  } catch (err) {
    console.error("Social Login Error", err);
  }
}

export const handleGoogleLogin = () =>
  handleSocialLogin(new GoogleAuthProvider());

export const handleGithubLogin = () =>
  handleSocialLogin(new GithubAuthProvider());

export const handleEmailLogin = async ({email, password}: IUserAuth) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    console.log("Email Login Success:", result.user)
    const idToken = await result.user.getIdToken()
    sessionStorage.setItem("accessToken", idToken);
    const { success, data, err } = await UserAPI.login();
    if (!success) {
      console.error("Error logging in user:", err);
      return { success: false };
    }

    sessionStorage.setItem("accessToken", data.access_token);
    return { success, data };
  } catch (err) {
    console.error("Email Login Error", err)
  }
}

export const handleEmailRegister = async ({
  email,
  password
}: IUserAuth): Promise<any|void> => {
  try {
    // Creates the user in Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Email Registration Success:", result.user);
    // Optionally, immediately sign them in and grab a token
    const idToken = await result.user.getIdToken();
    const info = getAdditionalUserInfo(result);
    if (info?.isNewUser) {
        sessionStorage.setItem("accessToken", idToken);
        const {success, data, err} = await UserAPI.registerUnverified();

        if (!success) {
          console.error("Error registering user:", err);
          return { success: false};
        }

        return { success: true };
    }
    return idToken;
  } catch (err) {
    console.error("Email Registration Error:", err);
  }
};