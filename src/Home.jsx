// src/pages/Home.jsx
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent
} from "@mui/material";

function Home() {
  return (
    <Container maxWidth="md" sx={{ textAlign: "center", py: 6 }}>
      
      {/* 🔥 Hero Section */}
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Play. Win. Give Back.
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        A modern golf platform where your performance turns into rewards —
        and every game helps support meaningful charities.
      </Typography>

      {/* CTA Buttons */}
      <Box sx={{ mb: 5 }}>
        <Link to="/signup" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            size="large"
            sx={{ mr: 2, px: 4, py: 1.2 }}
          >
            Get Started
          </Button>
        </Link>

        <Link to="/login" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            size="large"
            sx={{ px: 4, py: 1.2 }}
          >
            Login
          </Button>
        </Link>
      </Box>

      {/* 🧠 How it works */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                How It Works
              </Typography>
              <ul style={{ paddingLeft: "20px", textAlign: "left" }}>
                <li>✔ Subscribe monthly or yearly</li>
                <li>✔ Enter your last 5 golf scores</li>
                <li>✔ Automatically enter monthly prize draws</li>
                <li>✔ Support a charity with every subscription</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>

        {/* 🎯 Features */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Why Join?
              </Typography>
              <ul style={{ paddingLeft: "20px", textAlign: "left" }}>
                <li>🏆 Win exciting rewards every month</li>
                <li>💙 Contribute to charities you care about</li>
                <li>📊 Track your performance easily</li>
                <li>⚡ Simple, fast, and modern experience</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🚀 Final CTA */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Ready to start your journey?
        </Typography>

        <Link to="/signup" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            size="large"
            sx={{ px: 5, py: 1.5, mt: 2 }}
          >
            Join Now
          </Button>
        </Link>
      </Box>

    </Container>
  );
}

export default Home;