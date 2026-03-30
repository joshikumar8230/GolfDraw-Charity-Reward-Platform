// src/pages/Login.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent
} from "@mui/material";
import Swal from "sweetalert2";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Store auth data
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("role", data.role);
     sessionStorage.setItem("charity_id", data.charity_id || "");

      // 🔥 ADMIN FLOW
      if (data.role === "admin") {
        Swal.fire("Welcome Admin 👑", "Login successful", "success");
        navigate("/AdminDashboard");
        return;
      }

      // ❌ NO SUBSCRIPTION
      if (!data.is_active) {
        Swal.fire(
          "Subscription Required 💳",
          "Please subscribe to continue",
          "warning"
        );
        navigate("/subscribe");
        return;
      }

      // ⚠️ NO CHARITY SELECTED
      if (!data.charity_id) {
        Swal.fire(
          "Select Charity ❤️",
          "Please choose a charity to continue",
          "info"
        );
        navigate("/SelectCharity");
        return;
      }

      // ✅ SUCCESS
      Swal.fire("Success 🎉", "Login successful", "success");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      Swal.fire("Error ❌", err.message, "error");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card sx={{ width: "100%", borderRadius: 3, boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            
            <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
              Welcome Back
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Login to continue your journey ⛳
            </Typography>

            <TextField
              label="Username"
              fullWidth
              sx={{ mb: 2 }}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              sx={{ mb: 3 }}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleLogin}
            >
              Login
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Don’t have an account?{" "}
              <Link to="/signup" style={{ textDecoration: "none", color: "#1976d2" }}>
                Sign up
              </Link>
            </Typography>

          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;