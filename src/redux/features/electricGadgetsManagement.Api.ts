import {
  ElectricGadget,
  TQueryParam,
  TResponseRedux,
} from "@/types/sidebar.types";
import { baseApi } from "../api/baseApi";

const gadgetsManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllGadgets: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }
        return {
          url: "/api/gadgets",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["gadget"],
      transformResponse: (response: TResponseRedux<ElectricGadget[]>) => {
        return {
          data: response?.data,
        };
      },
    }),

    getGadgetsById: builder.query({
      query: (_id) => {
        console.log(`Fetching data for gadget with ID: ${_id}`);
        return {
          url: `/api/gadgets/${_id}`,
          method: "GET",
        };
      },
      providesTags: ["gadget", "cart"],
    }),
    deleteGadgets: builder.mutation({
      query: (_id) => {
        return {
          url: `/api/gadgets/${_id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["gadget"],
    }),

    updateGadgets: builder.mutation({
      query: (options) => {
        console.log("inside base api", options); //hubabu object tai asbe.
        return {
          url: `api/gadgets/update/${options._id}`,
          method: "PUT",
          body: options.data,
        };
      },
      invalidatesTags: ["gadget"],
    }),

    getGadgetsByFiltering: builder.query({
      query: (filterOptions) => {
        return {
          url: "/api/gadgets/filter",
          method: "POST",
          body: filterOptions,
        };
      },
      providesTags: ["gadget", "sale"],
      transformResponse: (response: TResponseRedux<ElectricGadget[]>) => {
        return {
          data: { response },
        };
      },
    }),

    AddGadgets: builder.mutation({
      query: (data) => ({
        url: "/api/gadgets/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["gadget"],
    }),

    DeleteMulipleGadget: builder.mutation({
      query: (gadgetIds) => ({
        url: "/api/gadgets/delete-multiple",
        method: "POST",
        body: gadgetIds,
      }),
      invalidatesTags: ["gadget"],
    }),
  }),
});

export const {
  useAddGadgetsMutation,
  useGetAllGadgetsQuery,
  useGetGadgetsByFilteringQuery,
  useGetGadgetsByIdQuery,
  useDeleteGadgetsMutation,
  useUpdateGadgetsMutation,
  useDeleteMulipleGadgetMutation,
} = gadgetsManagementApi;
