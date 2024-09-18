import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { RootState } from "../store";
import { createApi } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://electric-gadgets-management-backened-roan.vercel.app",
  // credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    // console.log(token);
    if (token) {
      headers.set("authorization", `${token}`);
    }

    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  tagTypes: ["gadget", "sale", "cart"],
  baseQuery: baseQuery,
  endpoints: () => ({}),
});
