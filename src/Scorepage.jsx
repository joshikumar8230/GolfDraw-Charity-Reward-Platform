// src/pages/Scores.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip
} from "@mui/material";
import Swal from "sweetalert2";

function Scorepage() {
  const [score, setScore] = useState("");
  const [scores, setScores] = useState([]);
  const [drawStatus, setDrawStatus] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchScores();
    checkDrawStatus();
  }, []);

  const fetchScores = async () => {
    const token = sessionStorage.getItem("token");

    const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/scores", {
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();
    setScores(data);
  };

  const checkDrawStatus = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/results", {
        headers: { Authorization: token },
      });

      const data = await res.json();
      setDrawStatus(data.status);

    } catch (err) {
      console.error("Error fetching draw status:", err);
      setDrawStatus("error");
    }
  };

  const addScore = async () => {
    const numScore = Number(score);

    // ❌ Empty check
    if (!score) {
      Swal.fire({
        title: "Oops!",
        text: "Enter a score",
        icon: "warning",
      });
      return;
    }

    // ❌ Range validation
    if (numScore < 1 || numScore > 45) {
      Swal.fire({
        title: "Invalid Score 🚫",
        text: "Score must be between 1 and 45",
        icon: "error",
        confirmButtonColor: "#d32f2f",
      });
      return;
    }

    const token = sessionStorage.getItem("token");

    const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/add-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ score: numScore }),
    });

    const data = await res.json();

    if (data.message) {
      Swal.fire({
        title: "Success 🎯",
        text: "Score added!",
        icon: "success",
        confirmButtonColor: "#1976d2",
      });
      setScore("");
      fetchScores();
    } else {
      Swal.fire({
        title: "Error ❌",
        text: data.error,
        icon: "error",
      });
    }
  };

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Score Management
        </Typography>

        <Grid container spacing={3} direction="column">

          {/* ✅ Add Score */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add Score
                </Typography>

                {drawStatus !== "completed" ? (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      type="number"
                      label="Score (1-45)"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      inputProps={{ min: 1, max: 45 }} // ✅ restrict input
                      fullWidth
                    />

                    <Button
                      variant="contained"
                      onClick={addScore}
                    >
                      Add
                    </Button>
                  </Box>
                ) : (
                  <Chip
                    label="Scores locked for this month"
                    color="warning"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ✅ Scores List */}
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
                        {new Date(s.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ✅ Draw Status */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Draw Status
                </Typography>

                {drawStatus === "no_draw" && (
                  <Chip label="No draw created" color="default" />
                )}

                {drawStatus === "pending" && (
                  <Chip label="Waiting for results" color="info" />
                )}

                {drawStatus === "completed" && (
                  <>
                    <Chip label="Completed" color="success" sx={{ mb: 2 }} />
                    <Box>
                      <Button
                        variant="contained"
                        onClick={() => navigate("/ViewResults")}
                      >
                        🎯 View Results
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>
    </>
  );
}

export default Scorepage;