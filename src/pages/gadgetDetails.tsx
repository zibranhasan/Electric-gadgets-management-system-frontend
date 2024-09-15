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
  const { id } = useParams();
  const user = useAppSelector(userCurrentUser);
  const userId = user?.userId;

  const { data: singleData } = useGetGadgetsByIdQuery(id);
  const gadgetDetails = singleData?.data;

  const { data: cartData } = useGetOrdersByUserIdQuery(userId);
  const [updateCart] = useUpdateCartMutation();

  const [isAddedToCart, setIsAddedToCart] = useState(false);

  useEffect(() => {
    if (cartData && id) {
      // Check if the id exists in any of the cart items
      const isItemInCart = cartData.some((cart) =>
        cart.items?.some((item) => item.gadgetsId?._id === id)
      );
      setIsAddedToCart(isItemInCart);
    }
  }, [cartData, id]);

  const handleAddToCart = async (gadget_Id: string) => {
    try {
      await updateCart({
        userId,
        gadgetsId: gadget_Id,
        quantity: 1,
      }).unwrap();
      console.log("Cart updated successfully");
      // Refetch cart data to ensure the state is updated
      await refetchCart();
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  };

  const refetchCart = async () => {
    // Ensure cart data is refetched after updating
    const updatedCartData = await refetch();
    const isItemInCart = updatedCartData.items?.some(
      (item) => item?.gadgetsId?._id === gadgetDetails?._id
    );
    setIsAddedToCart(isItemInCart);
  };

  if (!gadgetDetails) {
    return <p>Loading...</p>;
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
