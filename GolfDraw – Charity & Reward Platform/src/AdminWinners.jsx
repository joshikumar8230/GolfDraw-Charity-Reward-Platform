// src/pages/AdminWinners.js
import { useEffect, useState } from "react";
import Adminnavbar from "./Adminnavbar";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  Button,
  Dialog,
  DialogContent,
  Pagination,
  CircularProgress
} from "@mui/material";
import Swal from "sweetalert2";

function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/admin/winners", {
        headers: { Authorization: token },
      });

      const data = await res.json();
      setWinners(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch winners", "error");
    }
  };

  // ✅ Approve
  const approveWinner = async (id) => {
    const token = sessionStorage.getItem("token");

    try {
      await fetch(`http://localhost:5000/admin/approve-winner/${id}`, {
        method: "POST",
        headers: { Authorization: token },
      });

      Swal.fire("Success", "Winner approved", "success");
      fetchWinners();
    } catch (err) {
      Swal.fire("Error", "Approve failed", "error");
    }
  };

  // ❌ Reject
  const rejectWinner = async (id) => {
    const token = sessionStorage.getItem("token");

    try {
      await fetch(`http://localhost:5000/admin/reject-winner/${id}`, {
        method: "POST",
        headers: { Authorization: token },
      });

      Swal.fire("Rejected", "Winner rejected", "warning");
      fetchWinners();
    } catch (err) {
      Swal.fire("Error", "Reject failed", "error");
    }
  };

  // 💰 PAY WINNER (RAZORPAY)
  const payWinner = async (winner) => {
    const token = sessionStorage.getItem("token");

    try {
      setLoading(true);

      // 1️⃣ Create payout order (backend)
      const res = await fetch(
        `http://localhost:5000/admin/create-payout/${winner.id}`,
        {
          method: "POST",
          headers: { Authorization: token },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.error, "error");
        return;
      }

      // 2️⃣ Razorpay popup
      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Golf Charity App",
        description: "Winner Payout",
        order_id: data.orderId,

        handler: async function (response) {
          // 3️⃣ Verify payment
          const verifyRes = await fetch(
            `http://localhost:5000/admin/verify-payout`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              body: JSON.stringify({
                ...response,
                winner_id: winner.id,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            Swal.fire("Paid 🎉", "Winner paid successfully", "success");
            fetchWinners();
          } else {
            Swal.fire("Error", "Payment failed", "error");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Payment failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "pending":
        return <Chip label="Pending" color="warning" />;
      case "approved":
        return <Chip label="Approved" color="success" />;
      case "paid":
        return <Chip label="Paid" color="primary" />;
      case "rejected":
        return <Chip label="Rejected" color="error" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  // Pagination
  const startIndex = (page - 1) * itemsPerPage;
  const selectedWinners = winners.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(winners.length / itemsPerPage);

  return (
    <>
      <Adminnavbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🏆 Winners Management
        </Typography>

        {winners.length === 0 ? (
          <Typography>No winners yet</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {selectedWinners.map((w) => (
                <Grid item xs={12} md={6} key={w.id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>

                      {/* Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6">
                          {w.users?.username}
                        </Typography>

                        {getStatusChip(w.status)}
                      </Box>

                      <Typography>
                        <b>Month:</b> {w.draws?.draw_month}
                      </Typography>

                      <Typography>
                        <b>Match:</b> {w.match_count}
                      </Typography>

                      <Typography>
                        <b>Prize:</b> ₹{w.prize_amount}
                      </Typography>

                      {/* Numbers */}
                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        {w.draws?.numbers?.map((n) => (
                          <Chip key={n} label={n} color="primary" />
                        ))}
                      </Box>

                      {/* Proof */}
                      <Box sx={{ mt: 2 }}>
                        {w.proof_url ? (
                          <img
                            src={w.proof_url}
                            alt="proof"
                            width="150"
                            style={{ borderRadius: "8px", cursor: "pointer" }}
                            onClick={() => setSelectedImage(w.proof_url)}
                          />
                        ) : (
                          <Typography color="text.secondary">
                            No proof uploaded
                          </Typography>
                        )}
                      </Box>

                      {/* ACTIONS */}
                      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                        {w.status === "pending" && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => approveWinner(w.id)}
                            >
                              Approve
                            </Button>

                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => rejectWinner(w.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {/* 💰 PAY BUTTON */}
                        {w.status === "approved" && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => payWinner(w)}
                            disabled={loading}
                          >
                            {loading ? (
                              <CircularProgress size={20} />
                            ) : (
                              "💰 Pay"
                            )}
                          </Button>
                        )}
                      </Box>

                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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

      {/* IMAGE MODAL */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
      >
        <DialogContent>
          <img
            src={selectedImage}
            alt="zoom"
            style={{ width: "100%", borderRadius: "10px" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminWinners;