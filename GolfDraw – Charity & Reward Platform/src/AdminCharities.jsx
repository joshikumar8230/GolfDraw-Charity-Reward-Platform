// src/pages/AdminCharities.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Adminnavbar from "./Adminnavbar";
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  Box,
  Dialog,
  DialogContent,
  CircularProgress
} from "@mui/material";
import Swal from "sweetalert2";

function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true); // 🔥 NEW

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const token = sessionStorage.getItem("token");

    try {
      setLoading(true); // 🔥 START LOADING

      const res = await fetch("http://localhost:5000/admin/charities", {
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setCharities(data);
      } else {
        console.error(data);
        Swal.fire("Error", "Invalid response", "error");
      }

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch charities", "error");
    } finally {
      setLoading(false); // 🔥 STOP LOADING
    }
  };

  return (
    <>
      <Adminnavbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🏥 Charity Management
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/CreateCharity")}
          >
            ➕ Create Charity
          </Button>
        </Box>

        {/* 🔥 LOADING UI */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : charities.length === 0 ? (
          <Typography>No charities found</Typography>
        ) : (
          <Paper sx={{ borderRadius: 3, boxShadow: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell><b>Image</b></TableCell>
                    <TableCell><b>Name</b></TableCell>
                    <TableCell><b>Description</b></TableCell>
                    <TableCell><b>Total Users</b></TableCell>
                    <TableCell><b>Total Donation</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {charities
                    .slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    .map((c) => (
                      <TableRow key={c.id} hover>

                        <TableCell>
                          <img
                            src={c.image_url}
                            alt="charity"
                            width="70"
                            style={{
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                            onClick={() => setSelectedImage(c.image_url)}
                          />
                        </TableCell>

                        <TableCell>{c.name}</TableCell>

                        <TableCell>
                          {c.description.length > 50
                            ? c.description.substring(0, 50) + "..."
                            : c.description}
                        </TableCell>

                        <TableCell>{c.total_users}</TableCell>

                        <TableCell>
                          ₹{c.total_donation || 0}
                        </TableCell>

                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={charities.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </Paper>
        )}
      </Container>

      {/* 🔥 IMAGE MODAL */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
      >
        <DialogContent>
          <img
            src={selectedImage}
            alt="zoom"
            style={{
              width: "100%",
              borderRadius: "10px",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminCharities;