// src/services/ports.ts
export const ServicePort = {
  USER: '5003',
  AUTH: '5014',      // if/when you want to use it for your social‐login redirects
} as const;

// src/services/UserAPI.ts
import { Requests } from "./Requests";
import type { IEditUser, IPayloadCreateUser } from "../interface/user";


export class UserAPI {
  public static createUser = (payload: IPayloadCreateUser) =>
    Requests.doPost(payload, "/api/user", ServicePort.USER);

  public static createOrgUser = (payload: IPayloadCreateUser, orgId: string) =>
    Requests.doPost(
      payload,
      `/api/user?entity_id=${encodeURIComponent(orgId)}&entity_type=organization`,
      ServicePort.USER
    );

  public static getUserByUsername = (username: string) =>
    Requests.doGet(
      `/api/user?username=${encodeURIComponent(username)}`,
      ServicePort.USER
    );

  public static getUserById = (userId: string) =>
    Requests.doGet(
      `/api/user?user_id=${encodeURIComponent(userId)}`,
      ServicePort.USER
    );

  public static updateUser = (payload: IEditUser, userId: string) =>
    Requests.doPatch(
      payload,
      `/api/user/${encodeURIComponent(userId)}`,
      ServicePort.USER
    );

  public static register = () =>
    Requests.doGet("/api/auth/exchange", ServicePort.USER);

  public static registerUnverified = () =>
    Requests.doGet(
      `/api/user/action/register`,
      ServicePort.USER
    );

  public static login = () => Requests.doPost(null, "/api/user/action/login", ServicePort.USER);
  

  public static verifyAccount = (token: string) =>
    Requests.doGet(
      `/api/user/action/verify-account?token=${encodeURIComponent(token)}`,
      ServicePort.USER
    );

  public static getAccessToken = () =>
    Requests.doGet("/api/auth/access_token", ServicePort.USER);

  public static getGithubToken = () =>
    Requests.doGet("/api/auth/github_token", ServicePort.USER);

  public static getGithubUserRepos = () =>
    Requests.doGet("/api/github/repos", ServicePort.USER);

  // social‐login redirects (you could hook these up via Requests if you wanted)
  public static loginWithGithub = () => {
    window.location.href = `http://localhost:${ServicePort.AUTH}/api/github/login`;
  };

  public static loginWithGoogle = () => {
    window.location.href = `http://localhost:${ServicePort.AUTH}/api/google/login`;
  };

  
}
