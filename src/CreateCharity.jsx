// src/pages/CreateCharity.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Adminnavbar from "./Adminnavbar";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box
} from "@mui/material";
import Swal from "sweetalert2";

function CreateCharity() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name || !description || !file) {
      Swal.fire({
        title: "Missing Fields ⚠️",
        text: "All fields are required",
        icon: "warning",
      });
      return;
    }

    const token = sessionStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", file);

    try {
      const res = await fetch(
        "https://golfdraw-charity-reward-platform-2.onrender.com/admin/create-charity",
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.error) {
        Swal.fire("Error ❌", data.error, "error");
      } else {
        Swal.fire({
          title: "Success 🎉",
          text: "Charity created successfully!",
          icon: "success",
          confirmButtonColor: "#1976d2",
        });

        navigate("/AdminCharities");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create charity", "error");
    }
  };

  return (
    <>
      <Adminnavbar />

      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
          <CardContent>

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              ➕ Create Charity
            </Typography>

            {/* 🔥 Name */}
            <TextField
              label="Charity Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* 🔥 Description */}
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* 🔥 File Upload */}
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component="label">
                Upload Image
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Button>

              {/* 🔥 Preview */}
              {file && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* 🔥 Submit */}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleSubmit}
            >
              Create Charity
            </Button>

          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default CreateCharity;