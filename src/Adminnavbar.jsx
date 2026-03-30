// src/components/Adminnavbar.js
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from "@mui/material";
import Swal from "sweetalert2";

function Adminnavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Admin session will be ended",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#1976d2",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
              sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("charity_id");
        navigate("/login");

        Swal.fire("Logged out!", "", "success");
      }
    });
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#111827" }}>
      <Toolbar>

        {/* 🔥 Admin Logo */}
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/AdminDashboard")}
        >
          👑 Admin Panel
        </Typography>

        {/* 🔥 Navigation */}
        <Box sx={{ display: "flex", gap: 2 }}>

          <Button color="inherit" onClick={() => navigate("/AdminDashboard")}>
            Dashboard
          </Button>

          <Button color="inherit" onClick={() => navigate("/AdminWinners")}>
            Winners
          </Button>

          <Button color="inherit" onClick={() => navigate("/AdminUsers")}>
            Users
          </Button>

          <Button color="inherit" onClick={() => navigate("/AdminCharities")}>
            Charity
          </Button>

            <Button color="inherit" onClick={() => navigate("/Profile")}>
            Profile
          </Button>

          {/* 🔥 Logout */}
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

export default Adminnavbar;