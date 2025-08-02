// src/firebaseConnect.ts
// This file initializes Firebase and exports the auth object for use in the application.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../config/firebaseConfig";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
