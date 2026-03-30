// src/pages/Dashboard.js
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip
} from "@mui/material";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const token = sessionStorage.getItem("token");

    const res = await fetch("http://localhost:5000/dashboard", {
      headers: {
        Authorization: token,
      },
    });

    const result = await res.json();
    setData(result);
  };

  // ✅ Format date helper
  const formatDate = (date) => {
    return date ? date.slice(0, 10) : "-";
  };

  if (!data)
    return (
      <Typography align="center" sx={{ mt: 5 }}>
        Loading...
      </Typography>
    );

  const { user, scores, draw } = data;

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3} direction="column">

          {/* ✅ Subscription */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subscription
                </Typography>

                <Box sx={{ mb: 1 }}>
                  Status:{" "}
                  <Chip
                    label={user.is_active ? "Active" : "Inactive"}
                    color={user.is_active ? "success" : "error"}
                    size="small"
                  />
                </Box>

                <Typography>Plan: {user.subscription_plan}</Typography>
                <Typography>
                  Expires: {formatDate(user.subscription_end)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* ✅ Charity */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Charity
                </Typography>

                <Typography>
                  Name: {user.charities?.name || "Not selected"}
                </Typography>

                <Typography>
                  Contribution: {user.charity_percentage || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* ✅ Scores */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Last 5 Scores
                </Typography>

                {scores.length === 0 ? (
                  <Typography>No scores yet</Typography>
                ) : (
                  scores.map((s) => (
                    <Box
                      key={s.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        p: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography>Score: {s.score}</Typography>
                      <Typography color="text.secondary">
                        {formatDate(s.created_at)}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ✅ Draw */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Draw
                </Typography>

                {draw ? (
                  <>
                    <Typography>
                      Numbers: {draw.numbers?.join(", ")}
                    </Typography>
                    <Typography>Status: {draw.status}</Typography>
                  </>
                ) : (
                  <Typography>No draw yet</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>
    </>
  );
}

export default Dashboard;