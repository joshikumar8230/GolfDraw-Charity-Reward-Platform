import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box
} from "@mui/material";
import Swal from "sweetalert2";

function Profile() {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/me", {
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (data.username) {
        setUsername(data.username);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    const token = sessionStorage.getItem("token");

    if (!oldPassword || !newPassword) {
      Swal.fire("Error", "All fields required", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (data.error) {
        Swal.fire("Error ❌", data.error, "error");
      } else {
        Swal.fire("Success 🎉", "Password updated!", "success");
        setOldPassword("");
        setNewPassword("");
      }

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4, maxWidth: 500 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          👤 Profile
        </Typography>

        <Box sx={{ mt: 3 }}>

          {/* 🔥 USERNAME (READ ONLY) */}
          <TextField
            label="Username"
            value={username}
            fullWidth
            disabled   // ❌ cannot edit
            sx={{ mb: 2 }}
          />

          {/* 🔥 PASSWORD CHANGE */}
          <TextField
            label="Old Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleChangePassword}
          >
            🔒 Change Password
          </Button>
        </Box>
      </Container>
    </>
  );
}

export default Profile;