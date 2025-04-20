import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Container,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import { db, auth } from "./firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await getDocs(
        collection(db, "users", user.uid, "checkins")
      );
      const data = snapshot.docs.map((doc) => doc.data());
      setCheckIns(data);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} color="default">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold">
            PeakPath 🧗
          </Typography>
          <Button color="error" variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          background: "linear-gradient(to right, #fdfbfb, #ebedee)",
          minHeight: "100vh",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            textAlign="center"
          >
            🧠 Your Check-In Timeline
          </Typography>

          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
            {checkIns.map((checkIn, i) => {
              const timestamp = checkIn.timestamp;
              const date =
                timestamp instanceof Timestamp
                  ? timestamp.toDate().toLocaleString()
                  : timestamp?.seconds
                  ? new Date(timestamp.seconds * 1000).toLocaleString()
                  : "Unknown Date";

              const cardHeight = Math.random() * 30 + 160;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Card
                    sx={{
                      height: cardHeight,
                      borderRadius: 6,
                      backdropFilter: "blur(10px)",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(245,245,245,0.8))",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      transition: "0.3s ease",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={checkIn.photoUrl}
                          alt="Check-in"
                          sx={{
                            width: 60,
                            height: 60,
                            border: "2px solid white",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                          }}
                        />
                        <Box>
                          <Typography fontWeight={600}>{date}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            📍{" "}
                            {checkIn.location
                              ? `${checkIn.location.latitude.toFixed(
                                  2
                                )}, ${checkIn.location.longitude.toFixed(2)}`
                              : "No location"}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ mt: 2 }}>
                        ✅ Check-in complete. Keep up the streak!
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </Masonry>
        </Container>
      </Box>
    </>
  );
}
