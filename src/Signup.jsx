// src/pages/Signup.js
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

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.message) {
      Swal.fire({
        title: "Success 🎉",
        text: "User created successfully!",
        icon: "success",
        confirmButtonColor: "#1976d2",
      });
      navigate("/login");
    } else {
      Swal.fire({
        title: "Error ❌",
        text: data.error,
        icon: "error",
        confirmButtonColor: "#d32f2f",
      });
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
              Create Account
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Join the platform and start your journey 🚀
            </Typography>

            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ py: 1.3, fontWeight: "bold" }}
              onClick={handleSignup}
            >
              Signup
            </Button>

            {/* 🔥 Switch to Login */}
            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Already have an account?{" "}
              <Link to="/login" style={{ textDecoration: "none", color: "#1976d2" }}>
                Login
              </Link>
            </Typography>

          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Signup;