// src/apollo/apolloClient.ts
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const GRAPHQL_HTTP_URL =
  import.meta.env.VITE_GRAPHQL_HTTP_URL ?? "http://localhost:5005/graphql";

const GRAPHQL_WS_URL =
  import.meta.env.VITE_GRAPHQL_WS_URL ?? "ws://localhost:5005/graphql";

// ────────────────────────────────
// HTTP LINK (cookies handle auth)
// ────────────────────────────────
const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
  credentials: "include", // ✅ sends your secure HTTP-only cookies
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.error(
        `[GraphQL error] op=${operation.operationName} message=${err.message}`,
        err
      );
    }
  }

  if (networkError) {
    console.error("[Network error]", networkError);
  }
});

const httpLinkChain = from([errorLink, httpLink]);

// ────────────────────────────────
// WS LINK (for subscriptions)
// ────────────────────────────────
// Browser will send cookies if domain/SameSite/secure are configured correctly.
const wsLink =
  typeof window === "undefined"
    ? null
    : new GraphQLWsLink(
        createClient({
          url: GRAPHQL_WS_URL,
          // No connectionParams: auth entirely via cookies
        })
      );

// ────────────────────────────────
// SPLIT: subscriptions → WS, others → HTTP
// ────────────────────────────────
const link =
  wsLink == null
    ? httpLinkChain
    : split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLinkChain
      );

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
