import { useGetAllGadgetsQuery } from "@/redux/features/electricGadgetsManagement.Api";
import { Button, Card, Row, Col, Spin } from "antd";
import { ElectricGadget } from "@/types/sidebar.types";
import "./App.css"; // Import custom CSS file
import { useAppSelector } from "./redux/hooks";
import { userCurrentToken } from "./redux/features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  useGetOrdersByUserIdQuery,
  useUpdateCartMutation,
} from "./redux/features/cartApi";
import { DecodedToken, Order, OrderItem } from "./types/cartTypes";

const { Meta } = Card;

const ElectricGadgetsManagement = () => {
  const token = useAppSelector(userCurrentToken);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setUserId(decoded.userId);
    } else {
      // setRedirectToLogin(true);
    }
  }, [token]);

  const { data: gadgetsData, isLoading: isGadgetsLoading } =
    useGetAllGadgetsQuery(undefined);
  const { data: ordersData, isLoading: isOrdersLoading } =
    useGetOrdersByUserIdQuery(userId, {
      skip: !userId,
    });
  console.log(ordersData);
  const orderedGadgetIds = useMemo(() => {
    if (!ordersData) return [];
    return ordersData.flatMap((order: Order) =>
      order.items.map((item: OrderItem) => item.gadgetsId._id.toString())
    );
  }, [ordersData]);

  console.log(orderedGadgetIds);
  const [updateCart] = useUpdateCartMutation();

  const handleAddToCart = async (id: string) => {
    if (!token) {
      setRedirectToLogin(true);
      return;
    }
    try {
      await updateCart({ userId, gadgetsId: id, quantity: 1 }).unwrap();
      console.log("Cart updated successfully");
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  };

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  if (isGadgetsLoading || isOrdersLoading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16}>
        {(gadgetsData?.data || []).map((gadget: ElectricGadget) => {
          const isAddedToCart = orderedGadgetIds.includes(
            gadget._id.toString()
          );
          return (
            <Col span={8} key={gadget._id} style={{ marginBottom: "16px" }}>
              <Card
                cover={
                  <img
                    alt={gadget.name}
                    src={gadget.photo}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                }
                actions={[
                  <Button
                    className="custom-button"
                    onClick={() => handleAddToCart(gadget._id)}
                    disabled={isAddedToCart}
                  >
                    {isAddedToCart ? "Added to Cart" : "Add to Cart"}
                  </Button>,
                ]}
                className="custom-card"
              >
                <Meta
                  title={gadget.name}
                  description={`Price: $${gadget.price}`}
                />
                <p>
                  <strong>Brand:</strong> {gadget.brand}
                </p>
                <p>
                  <strong>Category:</strong> {gadget.category}
                </p>
                <p>
                  <strong>Model Number:</strong> {gadget.modelNumber}
                </p>
                <p>
                  <strong>Operating System:</strong> {gadget.operatingSystem}
                </p>
                <p>
                  <strong>Power Source:</strong> {gadget.powerSource}
                </p>
                <p>
                  <strong>Release Date:</strong>{" "}
                  {new Date(gadget.releaseDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Weight:</strong> {gadget.weight} kg
                </p>
                <p>
                  <strong>Quantity:</strong> {gadget.quantity}
                </p>
                <p>
                  <strong>Connectivity:</strong>{" "}
                  {gadget.connectivity?.join(", ")}
                </p>
                <p>
                  <strong>Features:</strong> {gadget.features?.join(", ")}
                </p>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default ElectricGadgetsManagement;
