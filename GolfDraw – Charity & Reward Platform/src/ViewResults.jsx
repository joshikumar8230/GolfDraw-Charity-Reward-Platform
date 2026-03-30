// src/pages/Results.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip
} from "@mui/material";
import Swal from "sweetalert2";

function ViewResults() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const token = sessionStorage.getItem("token");

    const res = await fetch("http://localhost:5000/results", {
      headers: { Authorization: token },
    });

    const d = await res.json();
    setData(d);
  };

  const uploadProof = async () => {
    if (!file) {
      Swal.fire({
        title: "Oops!",
        text: "Please select a file",
        icon: "warning",
      });
      return;
    }

    const token = sessionStorage.getItem("token");

    const formData = new FormData();
    formData.append("proof", file);

    try {
      const res = await fetch(
        `http://localhost:5000/upload-proof/${data.winner.id}`,
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (result.error) {
        Swal.fire({
          title: "Error ❌",
          text: result.error,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Success 🎉",
          text: "Proof uploaded successfully!",
          icon: "success",
          confirmButtonColor: "#1976d2",
        });

        fetchResults();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Upload Failed",
        text: "Something went wrong",
        icon: "error",
      });
    }
  };

  if (!data)
    return (
      <Typography align="center" sx={{ mt: 5 }}>
        Loading...
      </Typography>
    );

  // ❌ No draw
  if (data.status === "no_draw") {
    return (
      <Container sx={{ mt: 4 }}>
        <Card sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">No draw created yet</Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate("/scores")}>
            Go Back
          </Button>
        </Card>
      </Container>
    );
  }

  // ⏳ Pending
  if (data.status === "pending") {
    return (
      <Container sx={{ mt: 4 }}>
        <Card sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5">⏳ Waiting for Draw</Typography>
          <Typography>Please check later</Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate("/scores")}>
            Go Back
          </Button>
        </Card>
      </Container>
    );
  }

  // ✅ Completed
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🎯 Draw Results
      </Typography>

      <Grid container spacing={3} direction="column">

        {/* 🔥 Draw Numbers */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6">Draw Numbers</Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                {data.drawNumbers.map((n) => (
                  <Chip key={n} label={n} color="primary" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 🔥 User Scores with Matching */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6">Your Scores</Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                {data.userScores.map((s, i) => {
                  const isMatch = data.drawNumbers.includes(s);

                  return (
                    <Chip
                      key={i}
                      label={s}
                      color={isMatch ? "success" : "error"}
                      variant={isMatch ? "filled" : "outlined"}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 🔥 Result */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>

              {data.winner ? (
                <>
                  <Typography variant="h5" gutterBottom>
                    🏆 You Won!
                  </Typography>

                  <Typography>Match Count: {data.winner.match_count}</Typography>
                  <Typography>Prize: ₹{data.winner.prize_amount}</Typography>

                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={data.winner.status}
                      color={
                        data.winner.status === "approved"
                          ? "success"
                          : data.winner.status === "rejected"
                          ? "error"
                          : data.winner.status === "paid"
                          ? "primary"
                          : "warning"
                      }
                    />
                  </Box>

                  {/* 🔥 Proof */}
                  {data.winner.proof_url && (
                    <Box sx={{ mt: 2 }}>
                      <Typography>Uploaded Proof:</Typography>
                      <img
                        src={data.winner.proof_url}
                        alt="proof"
                        width="200"
                        style={{ borderRadius: "10px", marginTop: "10px" }}
                      />
                    </Box>
                  )}

                  {/* 🔥 Upload */}
                  {!data.winner.proof_url && (
                    <Box sx={{ mt: 2 }}>
                      <Typography>Upload Proof</Typography>

                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                      />

                      <Button
                        variant="contained"
                        sx={{ mt: 1 }}
                        onClick={uploadProof}
                      >
                        Upload Proof
                      </Button>
                    </Box>
                  )}

                  {/* 🔥 Status Messages */}
                  <Box sx={{ mt: 2 }}>
                    {data.winner.status === "pending" && (
                      <Typography>⏳ Waiting for admin approval</Typography>
                    )}
                    {data.winner.status === "approved" && (
                      <Typography>✅ Approved! Payment coming soon</Typography>
                    )}
                    {data.winner.status === "paid" && (
                      <Typography>💰 Payment completed</Typography>
                    )}
                    {data.winner.status === "rejected" && (
                      <Typography>❌ Proof rejected. Upload again</Typography>
                    )}
                  </Box>
                </>
              ) : (
                <Typography variant="h6">
                  ❌ No winnings this time
                </Typography>
              )}

            </CardContent>
          </Card>
        </Grid>

        {/* 🔥 Back */}
        <Grid item xs={12}>
          <Button variant="outlined" onClick={() => navigate("/Scorepage")}>
            Back
          </Button>
        </Grid>

      </Grid>
    </Container>
  );
}

export default ViewResults;