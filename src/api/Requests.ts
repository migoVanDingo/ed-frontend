import axios, { type AxiosRequestConfig, type Method, type AxiosProgressEvent } from "axios";

const BASE_URL = "http://localhost";  // or pull from process.env

type RequestOptions = {
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  withCredentials?: boolean;
};

export class Requests {
  // ────────────────────────────────────────────────────────────────
  // PRIVATE “engine”
  // ────────────────────────────────────────────────────────────────
  private static request = async (
    method: Method,
    endpoint: string,
    port: string | number,
    options: RequestOptions = {}
  ): Promise<any> => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${BASE_URL}${port}${endpoint}`;

    const config: AxiosRequestConfig = {
      method,
      url,
      headers: options.headers,
      params: options.params,
      data: options.data,
      onUploadProgress: options.onUploadProgress,
      withCredentials: options.withCredentials,
    };

   try {
      const resp = await axios.request(config);
      return resp.data
    } catch (err) {
      console.error(`${method.toUpperCase()} ${url} ERROR:`, err);
      return {
        success: false,
        data: null,
        error: err,
      };
    }
  };

  // ────────────────────────────────────────────────────────────────
  // PUBLIC HELPER ARROWS
  // ────────────────────────────────────────────────────────────────

  public static uploadFile = async (
    formData: FormData,
    endpoint: string,
    port: string | number,
    accessToken: string | null,
    onUploadProgress?: (e: AxiosProgressEvent) => void
  ) =>
    await this.request("post", endpoint, port, {
      data: formData,
      headers: { "Content-Type": "multipart/form-data",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
       },
      onUploadProgress,
    });

  // AUTHENTICATED POSTS — include token
  public static doPost = async (data: any, endpoint: string, port: string, customHeaders: Record<string, string> = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };
    const res = await this.request("post", endpoint, port, {
      data,
      headers,
      withCredentials: true,
    });
    if (res.accessToken) {
      sessionStorage.setItem("accessToken", res.accessToken);
    }
    return res;
  };

  public static doGet = async (endpoint: string, port: string, customHeaders: Record<string, string> = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };
    return this.request("get", endpoint, port, {
      headers,
      withCredentials: true,
    });
  };

  public static doPatch = async (data: any, endpoint: string, port: string, customHeaders: Record<string, string> = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };
    return this.request("patch", endpoint, port, { data, headers, withCredentials: true, });
  };

  public static doPut = async (data: any, endpoint: string, port: string, customHeaders: Record<string, string> = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };
    return this.request("put", endpoint, port, { data, headers, withCredentials: true });
  };

  public static doDelete = async (endpoint: string, port: string, customHeaders: Record<string, string> = {}) =>
    this.request("delete", endpoint, port, {
        headers: {
            "Content-Type": "application/json",
            ...customHeaders,
        },
        withCredentials: true,  
    });
}
