import { Button, Layout, Menu } from "antd";
import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Ensure jwtDecode is correctly imported
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout, userCurrentToken } from "../../redux/features/auth/authSlice";
import { useGetOrdersByUserIdQuery } from "@/redux/features/cartApi";
import Sidebar from "./Sidebar";

const { Header, Content } = Layout;

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(userCurrentToken);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode<{ userId: string }>(token);
      setUserId(decodedToken?.userId || null);
    }
  }, [token]);

  const { data: ordersData } = useGetOrdersByUserIdQuery(userId, {
    skip: !userId,
  });

  const itemCount = useMemo(() => {
    return ordersData
      ? ordersData.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (count: any, order: any) => count + order.items.length,
          0
        )
      : 0;
  }, [ordersData]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Main Navigation Header */}
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",

          backgroundColor: "#001529",
        }}
      >
        <div
          className="logo"
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          GadgManager
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ gap: "16px" }}
          selectedKeys={[]}
        >
          {!token && (
            <>
              <Menu.Item key="home">
                <NavLink to="/">Home</NavLink>
              </Menu.Item>
              <Menu.Item key="register">
                <NavLink to="/register">Register</NavLink>
              </Menu.Item>
              <Menu.Item key="login">
                <NavLink to="/login">Login</NavLink>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Header>

      {/* Conditional Sidebar */}
      <Layout>
        {token && <Sidebar />}

        <Layout>
          {/* Secondary Header for User Info */}
          {token && (
            <Header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#001529",
              }}
            >
              <div
                style={{ color: "#fff", fontSize: "16px", fontWeight: "bold" }}
              >
                Items in Cart: {itemCount}
              </div>
              <Button type="primary" onClick={handleLogout}>
                Logout
              </Button>
            </Header>
          )}

          {/* Main Content Section */}
          <Content
            style={{
              margin: "24px 16px",
              padding: "24px",
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
