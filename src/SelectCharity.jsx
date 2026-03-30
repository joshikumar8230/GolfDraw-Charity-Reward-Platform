// src/pages/SelectCharity.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  TextField,
  Button,
  Chip
} from "@mui/material";
import Swal from "sweetalert2";

function SelectCharity() {
  const [charities, setCharities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [percentage, setPercentage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch("http://localhost:5000/charities", {
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setCharities(data);
      } else {
        console.error("Invalid response:", data);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const saveCharity = async () => {
    if (!selectedId) {
      Swal.fire("Select Charity", "Please select a charity", "warning");
      return;
    }

    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/select-charity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          charity_id: selectedId,
          percentage,
        }),
      });

      const data = await res.json();

      if (data.error) {
        Swal.fire("Error ❌", data.error, "error");
      } else {
        Swal.fire(
          "Success 🎉",
          `₹${data.donation} donated to charity ❤️`,
          "success"
        ).then(() => {
          navigate("/dashboard");
        });
      }

    } catch (err) {
      console.error(err);
      Swal.fire("Failed", "Failed to save charity", "error");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      
      {/* 🔥 Title */}
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        gutterBottom
      >
        ❤️ Choose Your Charity
      </Typography>

      {/* 🔥 Contribution Input */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 5,
        }}
      >
        <TextField
          label="Contribution %"
          type="number"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          inputProps={{ min: 10, max: 100 }}
          sx={{ width: 250 }}
        />
      </Box>

      {/* 🔥 Charity Grid */}
      <Grid container spacing={4} justifyContent="center">
        {charities.map((c) => {
          const isSelected = selectedId === c.id;

          return (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card
                onClick={() => setSelectedId(c.id)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  boxShadow: 3,
                  border: isSelected
                    ? "2px solid #4caf50"
                    : "1px solid #eee",
                  transition: "0.3s",

                  // 🔥 FIX HEIGHT
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",

                  "&:hover": {
                    transform: "scale(1.03)",
                  },
                }}
              >
                {/* 🔥 IMAGE FIX */}
                <CardMedia
                  component="img"
                  image={c.image_url}
                  alt="charity"
                  sx={{
                    height: 180,
                    objectFit: "cover",
                  }}
                />

                {/* 🔥 CONTENT FIX */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      {c.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {c.description}
                    </Typography>
                  </Box>

                  {isSelected && (
                    <Chip
                      label="Selected"
                      color="success"
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 🔥 Save Button */}
      <Box
        sx={{
          mt: 6,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={saveCharity}
        >
          💾 Save Selection
        </Button>
      </Box>
    </Container>
  );
}

export default SelectCharity;