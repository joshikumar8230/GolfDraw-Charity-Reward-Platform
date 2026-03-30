// src/pages/Subscription.js
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box
} from "@mui/material";
import Swal from "sweetalert2";

function Subscription() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

const handleSubscribe = async (plan) => {
  try {
    // 1️⃣ Create order
    const res = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    // 2️⃣ Razorpay popup
    const options = {
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "Golf App",
      description: `${plan} Subscription`,
      order_id: data.orderId,

      handler: async function (response) {
        // 3️⃣ Verify payment
        const verifyRes = await fetch("https://golfdraw-charity-reward-platform-2.onrender.com/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            ...response,
            plan,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          Swal.fire({
            title: "Success 🎉",
            text: "Payment successful!",
            icon: "success",
          }).then(() => {
            navigate("/SelectCharity");
          });
        } else {
          Swal.fire("Error", "Payment verification failed", "error");
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Payment failed to start", "error");
  }
};

  return (
    <Container sx={{ mt: 5 }}>
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        gutterBottom
      >
        Choose Your Plan
      </Typography>

      <Typography
        align="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Subscribe and start winning while supporting charities 💙
      </Typography>

      <Grid container spacing={4} justifyContent="center">

        {/* 🔥 Monthly Plan */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              textAlign: "center",
              p: 2,
              transition: "0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Monthly Plan
              </Typography>

              <Typography variant="h4" color="primary" gutterBottom>
                ₹1000
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Billed every month
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography>✔ Access monthly draws</Typography>
                <Typography>✔ Win exciting rewards</Typography>
                <Typography>✔ Support charity</Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => handleSubscribe("monthly")}
              >
                Choose Monthly
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 🔥 Yearly Plan */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 6,
              textAlign: "center",
              p: 2,
              border: "2px solid #1976d2",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Yearly Plan
              </Typography>

              <Typography variant="h4" color="primary" gutterBottom>
                ₹10000
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Best value 🚀
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography>✔ Save money yearly</Typography>
                <Typography>✔ Priority participation</Typography>
                <Typography>✔ More chances to win</Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => handleSubscribe("yearly")}
              >
                Choose Yearly
              </Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Container>
  );
}

export default Subscription;