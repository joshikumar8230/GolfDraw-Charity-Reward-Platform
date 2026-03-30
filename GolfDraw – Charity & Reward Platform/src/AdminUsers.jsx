// src/pages/AdminUsers.js
import { useEffect, useState } from "react";
import Adminnavbar from "./Adminnavbar";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  TablePagination
} from "@mui/material";
import Swal from "sweetalert2";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  // 🔥 Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/admin/users", {
        headers: { Authorization: token },
      });

      const data = await res.json();

      if (data.error) {
        Swal.fire("Error", data.error, "error");
      } else {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch users", "error");
    }
  };

  return (
    <>
      <Adminnavbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          👥 User Management
        </Typography>

        {users.length === 0 ? (
          <Typography>No users found</Typography>
        ) : (
          <Paper sx={{ borderRadius: 3, boxShadow: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell><b>Username</b></TableCell>
                    <TableCell><b>Plan</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Start Date</b></TableCell>
                    <TableCell><b>End Date</b></TableCell>
                    <TableCell><b>Charity</b></TableCell>
                    <TableCell><b>Contribution</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {users
                    .slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    .map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>{u.username}</TableCell>

                        <TableCell>
                          {u.subscription_plan || "-"}
                        </TableCell>

                        <TableCell>
                          {u.is_active ? (
                            <Chip label="Active" color="success" />
                          ) : (
                            <Chip label="Inactive" color="error" />
                          )}
                        </TableCell>

                        <TableCell>
                          {u.subscription_start
                            ? new Date(
                                u.subscription_start
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>

                        <TableCell>
                          {u.subscription_end
                            ? new Date(
                                u.subscription_end
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>

                        <TableCell>
                          {u.charities?.name || "Not selected"}
                        </TableCell>

                        <TableCell>
                          {u.charity_percentage
                            ? `${u.charity_percentage}%`
                            : "0%"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 🔥 Pagination */}
            <TablePagination
              component="div"
              count={users.length}
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
    </>
  );
}

export default AdminUsers;