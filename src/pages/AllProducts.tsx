import { userCurrentToken } from "@/redux/features/auth/authSlice";
import {
  useGetOrdersByUserIdQuery,
  useUpdateCartMutation,
} from "@/redux/features/cartApi";
import {
  useGetAllGadgetsQuery,
  useGetGadgetsByFilteringQuery,
} from "@/redux/features/electricGadgetsManagement.Api";
import { useAppSelector } from "@/redux/hooks";
import { Button, Card, Row, Select, Slider, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  DecodedToken,
  ElectricGadget,
  Order,
  OrderItem,
} from "@/types/cartTypes";
import "./styles/card.css"; // Import the CSS file here
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

type FilterOptionsKey =
  | "priceRange"
  | "brand"
  | "modelNumber"
  | "category"
  | "operatingSystem"
  | "connectivity"
  | "powerSource"
  | "features";

const AllProducts: React.FC = () => {
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [modelNumberOptions, setModelNumberOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [operatingSystemOptions, setOperatingSystemOptions] = useState<
    { value: string | undefined; label: string | undefined }[]
  >([]);
  const [powerSourceOptions, setPowerSourceOptions] = useState<
    { value: string | undefined; label: string | undefined }[]
  >([]);
  const [featuresOptions, setFeaturesOptions] = useState<
    { value: string | undefined; label: string | undefined }[]
  >([]);
  const [connectivityOptions, setConnectivityOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const token = useAppSelector(userCurrentToken);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setUserId(decoded.userId);
    }
  }, [token]);

  const { data: ordersData, isLoading: isOrdersLoading } =
    useGetOrdersByUserIdQuery(userId, {
      skip: !userId,
    });

  const orderedGadgetIds = useMemo(() => {
    if (!ordersData) return [];
    return ordersData.flatMap((order: Order) =>
      order.items.map((item: OrderItem) => item.gadgetsId._id.toString())
    );
  }, [ordersData]);

  const [updateCart] = useUpdateCartMutation();
  const navigate = useNavigate();
  const [filterOptions, setFilterOptions] = useState<{
    priceRange: [number, number];
    brand: string;
    modelNumber: string;
    category: string;
    operatingSystem: string;
    connectivity: string[];
    powerSource: string;
    features: string[];
  }>({
    priceRange: [0, 99990],
    brand: "",
    modelNumber: "",
    category: "",
    operatingSystem: "",
    connectivity: [],
    powerSource: "",
    features: [],
  });

  const { data: gadgetsData, isLoading } = useGetAllGadgetsQuery("");

  if (isLoading) {
    <h1>Loading.........</h1>;
  }

  //This is for category
  useEffect(() => {
    const categoryOptions = gadgetsData?.data?.map((item) => ({
      value: item.category,
      label: item.category,
    }));
    setCategoryOptions(categoryOptions || []);
  }, [gadgetsData]);

  //This is for brand
  useEffect(() => {
    const options = gadgetsData?.data?.map((item) => ({
      value: item.brand,
      label: item.brand,
    }));
    setBrandOptions(options || []);
  }, [gadgetsData]);

  //This is for model number
  useEffect(() => {
    const options = gadgetsData?.data?.map((item) => ({
      value: item.modelNumber,
      label: item.modelNumber,
    }));
    setModelNumberOptions(options || []);
  }, [gadgetsData]);

  //This is for operating system
  useEffect(() => {
    const options = gadgetsData?.data?.map((item) => ({
      value: item.operatingSystem,
      label: item.operatingSystem,
    }));
    setOperatingSystemOptions(options || []);
  }, [gadgetsData]);

  //This is for power source
  useEffect(() => {
    const options = gadgetsData?.data?.map((item) => ({
      value: item.powerSource,
      label: item.powerSource,
    }));

    setPowerSourceOptions(options || []);
  }, [gadgetsData]);

  //This is for features
  useEffect(() => {
    const options =
      gadgetsData?.data?.reduce<{ value: string; label: string }[]>(
        (acc, item) => {
          if (Array.isArray(item.features)) {
            item.features.forEach((featuresItem) => {
              acc.push({
                value: featuresItem || "",
                label: featuresItem || "",
              });
            });
          }
          return acc;
        },
        []
      ) || [];
    setFeaturesOptions(options);

    setFeaturesOptions(options || []);
  }, [gadgetsData]);

  //This is for connectivity
  useEffect(() => {
    const options =
      gadgetsData?.data?.reduce<{ value: string; label: string }[]>(
        (acc, item) => {
          if (Array.isArray(item.connectivity)) {
            item.connectivity.forEach((connectivityItem) => {
              acc.push({
                value: connectivityItem || "",
                label: connectivityItem || "",
              });
            });
          }
          return acc;
        },
        []
      ) || [];
    setConnectivityOptions(options);
  }, [gadgetsData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: FilterOptionsKey, value: any) => {
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMultiSelectChange = (key: FilterOptionsKey, values: any[]) => {
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      [key]: values,
    }));
  };

  const handleFilterSubmit = () => {
    // Handle filter submission here
  };

  const { data: gadgetsDataResponse, isLoading: isGadgetsLoading } =
    useGetGadgetsByFilteringQuery(filterOptions);

  const gadgetsDataByFiltering: ElectricGadget[] = Array.isArray(
    gadgetsDataResponse?.data?.response
  )
    ? gadgetsDataResponse.data.response
    : [];

  const handleAddToCart = async (gadget_Id: string) => {
    try {
      if (!token) {
        navigate("/login");
      }
      await updateCart({ userId, gadgetsId: gadget_Id, quantity: 1 }).unwrap();
      console.log("Cart updated successfully");
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  };

  if (isGadgetsLoading || isOrdersLoading) {
    return <Spin size="large" />;
  }

  const renderFilterOptions = (
    label: string,
    key: FilterOptionsKey,
    options: { value: string | undefined; label: string | undefined }[],
    isMultiSelect = false
  ) => (
    <div style={{ marginBottom: "20px" }}>
      <h1 style={{ marginRight: "16px", fontSize: "24px", color: "#333" }}>
        {label}:
      </h1>
      <Select
        mode={isMultiSelect ? "multiple" : undefined}
        allowClear
        placeholder={`Select ${label}`}
        style={{ width: 200, marginRight: 16 }}
        value={filterOptions[key]}
        onChange={(value) => {
          if (isMultiSelect) {
            if (Array.isArray(value)) {
              handleMultiSelectChange(key, value);
            }
          } else {
            handleFilterChange(key, value);
          }
        }}
      >
        {options.length > 0 && (
          <>
            <Option key="heading" disabled>
              {`Filtering according to ${label.toLowerCase()}`}
            </Option>
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </>
        )}
      </Select>
    </div>
  );

  return (
    <div>
      <Row gutter={20}>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            flexWrap: "wrap", // Corrected wrap property
            gap: "20px", // Adds spacing between filter elements
            justifyContent: "flex-start", // Aligns items to the left
            padding: "10px", // Adds padding around the filter section
            backgroundColor: "#f9f9f9", // Adds a light background color
            borderRadius: "8px", // Rounds the corners for a more modern look
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds a subtle shadow for depth
          }}
        >
          {renderFilterOptions("Category", "category", categoryOptions)}
          {renderFilterOptions("Brand", "brand", brandOptions)}
          {renderFilterOptions(
            "Model Number",
            "modelNumber",
            modelNumberOptions
          )}
          {renderFilterOptions(
            "Operating System",
            "operatingSystem",
            operatingSystemOptions
          )}
          {renderFilterOptions(
            "Connectivity",
            "connectivity",
            connectivityOptions,
            true
          )}
          {renderFilterOptions(
            "Power Source",
            "powerSource",
            powerSourceOptions
          )}
          {renderFilterOptions("Features", "features", featuresOptions, true)}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
              backgroundColor: "#fff", // Light background for the price filter
              padding: "10px", // Adds some padding around the price filter section
              borderRadius: "8px", // Rounded corners for a modern look
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for a lifted effect
            }}
          >
            <h1
              style={{
                marginRight: "16px",
                fontSize: "24px",
                color: "#333",
                whiteSpace: "nowrap", // Prevents text from wrapping
              }}
            >
              Price:
            </h1>
            <Slider
              range
              defaultValue={[0, 99990]}
              style={{ width: 200, marginRight: "16px" }}
              value={filterOptions.priceRange}
              onChange={(value) => handleFilterChange("priceRange", value)}
            />
          </div>

          <Button
            onClick={handleFilterSubmit}
            style={{
              backgroundColor: "#4CAF50", // Green background
              color: "white", // White text
              // padding: "10px 20px", // Padding for a larger button
              borderRadius: "5px", // Rounded corners
              border: "none", // Removes default border
              cursor: "pointer", // Changes the cursor to pointer on hover
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Adds depth with shadow
              transition: "background-color 0.3s ease", // Smooth background transition
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#45A049")
            } // Hover effect for background
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#4CAF50")
            } // Revert on hover out
          >
            Filter
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          {gadgetsDataByFiltering.map((gadget: ElectricGadget) => {
            const isAddedToCart = orderedGadgetIds.includes(
              gadget?._id.toString()
            );
            return (
              <Card
                key={gadget?._id}
                className="classic-card"
                cover={<img alt={gadget?.name} src={gadget?.photo} />}
              >
                <div className="classic-card-content">
                  <h2>{gadget?.name}</h2>
                  <p>Price: ${gadget?.price}</p>
                  <p>Brand: {gadget?.brand}</p>
                  <p>Available Stocks: {gadget?.quantity}</p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      className="custom-button"
                      onClick={() => handleAddToCart(gadget?._id)}
                      disabled={isAddedToCart}
                    >
                      {isAddedToCart ? "Added to Cart" : "Add to Cart"}
                    </Button>
                    <NavLink
                      to={`/dashboard/user/gadget-details/${gadget?._id}`}
                    >
                      <Button className="details-button">Details</Button>
                    </NavLink>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Row>
    </div>
  );
};

export default AllProducts;
