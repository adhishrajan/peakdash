import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsEvent {
  userId: string;
  screen: string;
  event: string;
  timestamp: any;
  duration_ms?: number;
}

const timeOptions = [
  { label: "All Time", value: "all" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 7 Days", value: "7" },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c"];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [screenFilter, setScreenFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    const fetchFlatAnalytics = async () => {
      const logs: AnalyticsEvent[] = [];

      const snapshot = await getDocs(collection(db, "all_analytics_logs"));
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.timestamp?.seconds) {
          logs.push(data as AnalyticsEvent);
        }
      });

      setAnalytics(logs);
      setLoading(false);
    };

    fetchFlatAnalytics();
  }, []);

  const filterByDate = (entries: AnalyticsEvent[]) => {
    if (timeRange === "all") return entries;
    const days = parseInt(timeRange);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return entries.filter((e) => e.timestamp?.seconds * 1000 >= cutoff);
  };

  const filtered = filterByDate(
    screenFilter === "all"
      ? analytics
      : analytics.filter((e) => e.screen === screenFilter)
  );

  const allScreens = [...new Set(analytics.map((log) => log.screen))];

  const averageDurationData = Object.entries(
    filtered.reduce((acc: any, curr) => {
      if (curr.duration_ms) {
        acc[curr.screen] = acc[curr.screen] || { total: 0, count: 0 };
        acc[curr.screen].total += curr.duration_ms;
        acc[curr.screen].count += 1;
      }
      return acc;
    }, {})
  ).map(([screen, data]: any) => ({
    screen,
    avgDuration: Math.round(data.total / data.count),
  }));

  const eventTypeData = Object.entries(
    filtered.reduce((acc: any, curr) => {
      acc[curr.event] = (acc[curr.event] || 0) + 1;
      return acc;
    }, {})
  ).map(([event, count]) => ({
    name: event,
    value: count,
  }));

  const lineData = filtered.reduce((acc: any, curr) => {
    const date = new Date(curr.timestamp.seconds * 1000)
      .toISOString()
      .split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineChartData = Object.entries(lineData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📊 Admin Analytics Dashboard
      </Typography>

      <Box display="flex" gap={3} mb={4}>
        <FormControl>
          <InputLabel>Filter by Screen</InputLabel>
          <Select
            value={screenFilter}
            label="Filter by Screen"
            onChange={(e) => setScreenFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All Screens</MenuItem>
            {allScreens.map((screen) => (
              <MenuItem key={screen} value={screen}>
                {screen}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {timeOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Avg Duration */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Avg Screen Duration (ms)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={averageDurationData}>
                    <XAxis dataKey="screen" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgDuration" fill="#1976d2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Event Type Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event Type Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {eventTypeData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Line Chart of Events Over Time */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Event Activity
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#82ca9d"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
