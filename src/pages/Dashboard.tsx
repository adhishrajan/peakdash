import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Avatar,
  Button,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import { auth, db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface Checkin {
  id: string;
  email: string;
  photoUrl?: string;
  timestamp: any;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export default function Dashboard() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const allCheckins: Checkin[] = [];

        const usersSnapshot = await getDocs(collection(db, "users"));
        for (const userDoc of usersSnapshot.docs) {
          const checkinRef = collection(db, "users", userDoc.id, "checkins");
          const checkinSnapshot = await getDocs(query(checkinRef, orderBy("timestamp", "desc")));

          checkinSnapshot.forEach((doc) => {
            const data = doc.data();
            allCheckins.push({
              id: doc.id,
              email: data.email,
              photoUrl: data.photoUrl,
              timestamp: data.timestamp?.toDate(),
              location: data.location,
            });
          });
        }

        setCheckins(allCheckins);
      } catch (err) {
        console.error("Error fetching checkins:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f9f9fc", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="#2b2d42">
          🏔️ PeakDash - Check-In History
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Log Out
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {checkins.map((checkin) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={checkin.id}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "all 0.3s ease",
                  ":hover": { boxShadow: 6, transform: "translateY(-4px)" },
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={checkin.photoUrl}
                    alt={checkin.email}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      {checkin.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {checkin.timestamp?.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <CardContent sx={{ p: 0 }}>
                  {checkin.location ? (
                    <Tooltip title="Gym Location" arrow>
                      <Chip
                        label={`📍 ${checkin.location.latitude.toFixed(
                          4
                        )}, ${checkin.location.longitude.toFixed(4)}`}
                        variant="outlined"
                        color="primary"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No location data
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
