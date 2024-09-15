import AllProducts from "@/pages/AllProducts";

import Checkout from "@/pages/Checkout";
import GadgetDetails from "@/pages/GadgetDetails";

export const userPaths = [
  {
    children: [
      {
        index: true,
        path: "products",
        element: <AllProducts />,
      },
      {
        name: "Checkout",
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "gadget-details/:id",
        element: <GadgetDetails />,
      },
    ],
  },
];
