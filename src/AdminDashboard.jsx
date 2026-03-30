import { useState, useEffect } from "react";
import Adminnavbar from "./Adminnavbar";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Grid
} from "@mui/material";
import Swal from "sweetalert2";

function AdminDashboard() {
  const token = sessionStorage.getItem("token");

  const [numbers, setNumbers] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestDraw();
  }, []);

  // ✅ FETCH LATEST DRAW
  const fetchLatestDraw = async () => {
    try {
      const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/admin/latest-draw", {
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (!data) {
        setNumbers([]);
        setStatus(null);
      } else {
        setStatus(data.status);

        if (data.status === "pending") {
          setNumbers(data.numbers || []);
        } else {
          setNumbers([]);
        }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE DRAW
  const createDraw = async () => {
    try {
      const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/admin/create-draw", {
        method: "POST",
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error ❌", data.error, "error");
        return;
      }

      setNumbers(data.numbers || []);
      setStatus("pending");

      Swal.fire("Success 🎉", "Draw created successfully", "success");

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error", "error");
    }
  };

  // ✅ RUN DRAW
  const runDraw = async () => {
    try {
      const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/admin/run-draw", {
        method: "POST",
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error ❌", data.error, "error");
        return;
      }

      setNumbers([]);
      setStatus("completed");

      Swal.fire("Completed 🎉", "Draw completed successfully", "success");

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error", "error");
    }
  };

  return (
    <>
      <Adminnavbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ⚙️ Admin Dashboard
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={3} direction="column">

            {/* 🔥 Actions */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6">
                    Draw Controls
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={createDraw}
                    >
                      🎯 Generate Draw
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      onClick={runDraw}
                    >
                      ▶️ Run Draw
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 🔥 Numbers */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6">
                    Generated Numbers
                  </Typography>

                  {status === "pending" && numbers.length > 0 ? (
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      {numbers.map((n) => (
                        <Chip key={n} label={n} color="primary" />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                      No draw generated
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        )}
      </Container>
    </>
  );
}

export default AdminDashboard;