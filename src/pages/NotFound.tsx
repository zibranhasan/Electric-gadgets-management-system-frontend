import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Navigate to the Home page
  };

  const handleGoLogin = () => {
    navigate("/login"); // Navigate to the Login page
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Button
        type="primary"
        onClick={handleGoHome}
        style={{ marginRight: "10px" }}
      >
        Go to Home
      </Button>
      <Button type="default" onClick={handleGoLogin}>
        Go to Login
      </Button>
    </div>
  );
};

export default NotFound;
