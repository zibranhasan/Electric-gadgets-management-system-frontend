import { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Card as AntdCard, Button } from "antd";
import { useAppSelector } from "@/redux/hooks";
import { jwtDecode } from "jwt-decode";
import {
  useGetOrdersByUserIdQuery,
  useDeleteCartMutation,
  useUpdateCartMutation,
} from "@/redux/features/cartApi";
import { useAddTransactionsMutation } from "@/redux/features/transactionApi";
import { DecodedToken, Order, OrderItem } from "@/types/cartTypes";
import "./styles/Checkout.css"; // Import your CSS file
import { userCurrentToken } from "@/redux/features/auth/authSlice";

const Checkout = () => {
  const [addTransaction] = useAddTransactionsMutation();
  const token = useAppSelector(userCurrentToken);
  const [userId, setUserId] = useState<string | null>(null);
  const [updateCart] = useUpdateCartMutation();
  const [deleteCart] = useDeleteCartMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { data: ordersData, refetch } = useGetOrdersByUserIdQuery(userId, {
    skip: !userId,
  });

  useEffect(() => {
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setUserId(decoded.userId);
    }
  }, [token]);

  const handleUpdateQuantity = async (gadgetsId: string, change: number) => {
    if (!userId || !ordersData) return;

    const orderContainingGadgetsId = ordersData.find((order: Order) =>
      order.items.find((i) => i.gadgetsId._id === gadgetsId)
    );

    if (!orderContainingGadgetsId) return;

    const itemContainingGadgetsId = orderContainingGadgetsId.items.find(
      (item: OrderItem) => item.gadgetsId._id === gadgetsId
    );

    if (!itemContainingGadgetsId || !itemContainingGadgetsId.gadgetsId) return;

    const currentQuantity = itemContainingGadgetsId.quantity || 0;
    const availableStock = itemContainingGadgetsId.gadgetsId.quantity || 0;

    const newQuantity = currentQuantity + change;

    if (newQuantity < 0 || newQuantity > availableStock) return;

    if (newQuantity === 0) {
      await handleDeleteItem(gadgetsId);
      return;
    }

    try {
      await updateCart({
        userId,
        gadgetsId,
        quantity: newQuantity,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  };

  const handleDeleteItem = async (gadgetsId: string) => {
    try {
      await deleteCart(gadgetsId).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  const totalQuantity = ordersData
    ? ordersData.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: any, order: any) =>
          acc +
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          order.items.reduce((sum: any, item: any) => sum + item.quantity, 0),
        0
      )
    : 0;

  const totalPrice = ordersData
    ? ordersData.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: any, order: any) =>
          acc +
          order.items.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: any, item: any) => sum + item.quantity * item.gadgetsId.price,
            0
          ),
        0
      )
    : 0;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      await addTransaction({
        ...values,
        userId,
        totalQuantity,
        totalPrice,
      }).unwrap();
      handleCancel();
      refetch();
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  return (
    <div className="checkout-container">
      <div className="order-items">
        {ordersData && ordersData.length > 0 ? (
          ordersData.map((order: Order) =>
            order.items.map((item) => (
              <AntdCard className="card" key={item.gadgetsId._id}>
                <div className="card-content">
                  <h3>{item.gadgetsId.name}</h3>
                  <img alt={item.gadgetsId.name} src={item.gadgetsId.photo} />
                  <p>
                    <strong>Model Number:</strong> {item.gadgetsId.modelNumber}
                  </p>
                  <p>
                    <strong>Brand:</strong> {item.gadgetsId.brand}
                  </p>

                  <p>
                    <strong>Available Stock:</strong> {item.gadgetsId.quantity}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {item.quantity}
                  </p>

                  <p>
                    <strong>Price:</strong> ${item.gadgetsId.price}
                  </p>
                  <div className="actions">
                    <Button
                      onClick={() =>
                        handleUpdateQuantity(item.gadgetsId._id, -1)
                      }
                    >
                      -
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateQuantity(item.gadgetsId._id, 1)
                      }
                    >
                      +
                    </Button>
                    <Button
                      onClick={() => handleDeleteItem(item.gadgetsId._id)}
                      style={{ color: "red" }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </AntdCard>
            ))
          )
        ) : (
          <p>No items found in your orders.</p>
        )}
      </div>

      <div className="cart-summary">
        <h2>Cart Summary</h2>
        {ordersData && ordersData.length > 0 ? (
          ordersData.map((order: Order) =>
            order.items.map((item) => (
              <div key={item.gadgetsId._id}>
                <p>
                  <strong>{item.gadgetsId.name}</strong>
                </p>
                <p>
                  Quantity: {item.quantity} x ${item.gadgetsId.price.toFixed(2)}{" "}
                  = ${(item.quantity * item.gadgetsId.price).toFixed(2)}
                </p>
              </div>
            ))
          )
        ) : (
          <p>No items in the cart.</p>
        )}
        <hr />
        <p>
          <strong>Total Quantity:</strong> {totalQuantity}
        </p>
        <p>
          <strong>Total Price:</strong> ${totalPrice.toFixed(2)}
        </p>
        <Button className="transaction-button" size="large" onClick={showModal}>
          Transaction
        </Button>
      </div>

      <Modal
        title="Add Transaction"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Buyer's Name"
            name="buyersName"
            rules={[{ required: true, message: "Please enter buyer's name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Contact Number"
            name="contactNumber"
            rules={[{ required: true, message: "Please enter contact number" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Selling Date"
            name="sellingDate"
            rules={[{ required: true, message: "Please select selling date" }]}
          >
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Checkout;
