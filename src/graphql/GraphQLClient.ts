import axios, { type AxiosRequestConfig, AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type GraphQLError = {
  message: string;
  path?: string[];
  extensions?: Record<string, any>;
};

type GraphQLResponse<TData> = {
  success: boolean;
  data: TData | null;
  errors?: GraphQLError[];
  status?: number;
};

type GraphQLRequestOptions = {
  variables?: Record<string, any>;
  headers?: Record<string, string>;
  endpoint?: string;          // default: "/graphql"
  withCredentials?: boolean;  // default: true
};

export class GraphQLClient {
  // Low-level engine: POST a GraphQL operation
  private static async request<TData = any>(
    query: string,
    port: string | number,
    options: GraphQLRequestOptions = {}
  ): Promise<GraphQLResponse<TData>> {
    const endpoint = options.endpoint ?? "/graphql";
    const url = `${BASE_URL}${port}${endpoint}`;

    const config: AxiosRequestConfig = {
      method: "POST",
      url,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      data: {
        query,
        variables: options.variables ?? {},
      },
      withCredentials: options.withCredentials ?? true,
    };

    try {
      const resp = await axios.request(config);
      const status = resp.status;
      const payload = resp.data as { data?: TData; errors?: GraphQLError[] };

      if (payload.errors && payload.errors.length > 0) {
        console.error(`GraphQL ERROR @ ${url}:`, payload.errors);
        return {
          success: false,
          data: payload.data ?? null,
          errors: payload.errors,
          status,
        };
      }

      return {
        success: true,
        data: (payload.data ?? null) as TData,
        errors: [],
        status,
      };
    } catch (err) {
      const axiosErr = err as AxiosError;

      console.error(`GraphQL REQUEST ERROR @ ${url}:`, axiosErr);

      return {
        success: false,
        data: null,
        errors: [
          {
            message: axiosErr.message ?? "Unknown GraphQL request error",
          },
        ],
        status: axiosErr.response?.status,
      };
    }
  }

  // Convenience for queries
  public static async query<TData = any>(
    query: string,
    port: string | number,
    options: GraphQLRequestOptions = {}
  ): Promise<GraphQLResponse<TData>> {
    return this.request<TData>(query, port, options);
  }

  // Convenience for mutations (identical under the hood, but semantic)
  public static async mutate<TData = any>(
    mutation: string,
    port: string | number,
    options: GraphQLRequestOptions = {}
  ): Promise<GraphQLResponse<TData>> {
    return this.request<TData>(mutation, port, options);
  }
}
