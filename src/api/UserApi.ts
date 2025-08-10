// src/services/ports.ts
export const ServicePort = {
  USER: '5003',
  AUTH: '5014',      // if/when you want to use it for your social‐login redirects
} as const;

// src/services/UserAPI.ts
import { Requests } from "./Requests";

export class UserAPI {



  public static register = (token: string) =>
    Requests.doGet("/api/auth/exchange", ServicePort.USER, { Authorization: `Bearer ${token}` });

  public static registerUnverified = (token: string) =>
    Requests.doGet(
      `/api/user/action/register`,
      ServicePort.USER,
      { Authorization: `Bearer ${token}` }
    );

  public static login = (token: string) => Requests.doPost(null, "/api/user/action/login", ServicePort.USER, { Authorization: `Bearer ${token}` });

  public static verifyAccount = (token: string) =>
    Requests.doGet(
      `/api/user/action/verify-account?token=${encodeURIComponent(token)}`,
      ServicePort.USER
    );
  
}
