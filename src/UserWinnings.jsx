// src/pages/UserWinnings.js
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  Pagination
} from "@mui/material";

function UserWinnings() {
  const [winnings, setWinnings] = useState([]);

  // 🔥 Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchWinnings();
  }, []);

  const fetchWinnings = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/winnings", {
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setWinnings(data);
      } else {
        console.error("API Error:", data);
        setWinnings([]);
      }

    } catch (err) {
      console.error("Error fetching winnings:", err);
      setWinnings([]);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return <Chip label="⏳ Pending" color="warning" />;
      case "approved":
        return <Chip label="✅ Approved" color="success" />;
      case "paid":
        return <Chip label="💰 Paid" color="primary" />;
      case "rejected":
        return <Chip label="❌ Rejected" color="error" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  // 🔥 Pagination Logic
  const startIndex = (page - 1) * itemsPerPage;
  const selectedWinnings = winnings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalPages = Math.ceil(winnings.length / itemsPerPage);

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🏆 My Winnings
        </Typography>

        {!Array.isArray(winnings) || winnings.length === 0 ? (
          <Typography>No winnings yet 😢</Typography>
        ) : (
          <>
            <Grid container spacing={3} direction="column">
              {selectedWinnings.map((w) => (
                <Grid item xs={12} key={w.id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>

                      {/* 🔥 HEADER */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6">
                          {w.draws?.draw_month}
                        </Typography>

                        {renderStatus(w.status)}
                      </Box>

                      {/* 🔥 Draw Numbers */}
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        {w.draws?.numbers?.map((num, i) => (
                          <Chip key={i} label={num} color="primary" />
                        ))}
                      </Box>

                      <Typography>
                        <b>Match Count:</b> {w.match_count}
                      </Typography>

                      <Typography>
                        <b>Prize:</b> ₹{w.prize_amount}
                      </Typography>

                      <Typography>
                        <b>Date:</b>{" "}
                        {new Date(w.created_at).toLocaleDateString()}
                      </Typography>

                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* 🔥 Pagination UI */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Container>
    </>
  );
}

export default UserWinnings;