// src/components/Navbar.js
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from "@mui/material";
import Swal from "sweetalert2";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#1976d2",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role", data.role);
        sessionStorage.removeItem("charity_id", data.charity_id || "");
        navigate("/login");

        Swal.fire("Logged out!", "", "success");
      }
    });
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1e293b" }}>
      <Toolbar>

        {/* 🔥 Logo */}
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          ⛳ Golf App
        </Typography>

        {/* 🔥 Navigation Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>

          <Button color="inherit" onClick={() => navigate("/Scorepage")}>
            Scores
          </Button>

          <Button color="inherit" onClick={() => navigate("/UserWinnings")}>
            Winnings
          </Button>
           <Button color="inherit" onClick={() => navigate("/Profile")}>
            Profile
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;