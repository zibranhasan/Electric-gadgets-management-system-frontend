import { Card, Descriptions, Image, Button } from "antd";
import { useGetGadgetsByIdQuery } from "@/redux/features/electricGadgetsManagement.Api";
import { useParams } from "react-router-dom";
import {
  useGetOrdersByUserIdQuery,
  useUpdateCartMutation,
} from "@/redux/features/cartApi";
import { useAppSelector } from "@/redux/hooks";
import { userCurrentUser } from "@/redux/features/auth/authSlice";
import { useEffect, useState } from "react";

const GadgetDetails = () => {
  const { id } = useParams<{ id: string }>(); // Specify the type for useParams
  const user = useAppSelector(userCurrentUser);
  const userId = user?.userId || null; // Handle potential null value

  const {
    data: singleData,
    isLoading: isGadgetLoading,
    error: gadgetError,
  } = useGetGadgetsByIdQuery(id);
  const gadgetDetails = singleData?.data;

  const { data: cartData, refetch: refetchCartData } =
    useGetOrdersByUserIdQuery(userId, { skip: !userId });
  const [updateCart] = useUpdateCartMutation();

  const [isAddedToCart, setIsAddedToCart] = useState(false);

  useEffect(() => {
    if (cartData && id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isItemInCart = cartData.some((cart: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cart.items?.some((item: any) => item.gadgetsId?._id === id)
      );
      setIsAddedToCart(isItemInCart);
    }
  }, [cartData, id]);

  const handleAddToCart = async (gadget_Id: string) => {
    if (!userId) return; // Ensure userId is available

    try {
      await updateCart({
        userId,
        gadgetsId: gadget_Id,
        quantity: 1,
      }).unwrap();
      console.log("Cart updated successfully");
      // Refetch cart data to ensure the state is updated
      await refetchCartData();
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  };

  if (isGadgetLoading) {
    return <p>Loading...</p>;
  }

  if (gadgetError) {
    return <p>Error loading gadget details.</p>;
  }

  if (!gadgetDetails) {
    return <p>No gadget details available.</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <Card title={gadgetDetails.name} bordered={false}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <div>
            <Image
              width={700}
              height={250}
              src={gadgetDetails.photo}
              alt={gadgetDetails.name}
            />
          </div>

          <div style={{ flexGrow: 1, paddingLeft: "20px" }}>
            <div style={{ marginTop: "20px" }}>
              <Button
                className="custom-button"
                onClick={() => handleAddToCart(gadgetDetails._id)}
                disabled={isAddedToCart}
              >
                {isAddedToCart ? "Added to Cart" : "Add to Cart"}
              </Button>
            </div>
            <Descriptions title="Gadget Details" layout="vertical" bordered>
              <Descriptions.Item label="Price">
                ${gadgetDetails.price}
              </Descriptions.Item>
              <Descriptions.Item label="Brand">
                {gadgetDetails.brand}
              </Descriptions.Item>
              <Descriptions.Item label="Model Number">
                {gadgetDetails.modelNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {gadgetDetails.category}
              </Descriptions.Item>
              <Descriptions.Item label="Operating System">
                {gadgetDetails.operatingSystem}
              </Descriptions.Item>
              <Descriptions.Item label="Connectivity">
                {gadgetDetails.connectivity.join(", ")}
              </Descriptions.Item>
              <Descriptions.Item label="Power Source">
                {gadgetDetails.powerSource}
              </Descriptions.Item>
              <Descriptions.Item label="Features">
                {gadgetDetails.features.join(", ")}
              </Descriptions.Item>
              <Descriptions.Item label="Weight">
                {gadgetDetails.weight} kg
              </Descriptions.Item>
              <Descriptions.Item label="Available Stocks">
                {gadgetDetails.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Release Date">
                {new Date(gadgetDetails.releaseDate).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GadgetDetails;
