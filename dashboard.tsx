import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/metric-card";
import { EfficiencyGauge } from "@/components/efficiency-gauge";
import { TimeSeriesChart } from "@/components/time-series-chart";
import { AlertBanner } from "@/components/alert-banner";
import { RealTimeSensorMonitor } from "@/components/real-time-sensor-monitor";
import { Zap, Sun, Thermometer, Droplets, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats, HistoricalData } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 1000, // Refetch every 1 second for real-time dashboard updates
  });
  
  const { isConnected: wsConnected, latestData } = useWebSocket();
  
  // Auto-refresh when new real-time data arrives
  useEffect(() => {
    if (latestData) {
      refetch();
    }
  }, [latestData, refetch]);

  const { data: historicalData, isLoading: historyLoading } = useQuery<HistoricalData>({
    queryKey: ["/api/dashboard/history"],
  });

  const chartData = historicalData?.readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: reading.energyOutput,
  })) || [];

  if (statsLoading || historyLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-card animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || !stats.currentReading) return null;

  const getEfficiencyStatus = (efficiency: number) => {
    if (efficiency >= 75) return "success";
    if (efficiency >= 50) return "warning";
    return "error";
  };

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              Real-time solar panel monitoring and performance analytics
            </p>
            <Badge variant={wsConnected ? "default" : "secondary"} className="gap-1">
              {wsConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {wsConnected ? "Live" : "Offline"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-refresh"
            className="hover-elevate active-elevate-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-download-report"
            className="hover-elevate active-elevate-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {stats.activeAlerts.length > 0 && (
        <div className="space-y-3">
          {stats.activeAlerts.map((alert) => (
            <AlertBanner key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Current"
          value={stats.currentReading?.currentLevelMA?.toFixed(0) || "0"}
          unit="mA"
          status={stats.currentReading?.overload ? "error" : "success"}
          icon={<Zap className="h-5 w-5" />}
          testId="card-current"
        />
        <MetricCard
          title="Power"
          value={stats.currentReading?.powerOutputMW?.toFixed(0) || "0"}
          unit="mW"
          status="normal"
          icon={<Zap className="h-5 w-5" />}
          testId="card-power"
        />
        <MetricCard
          title="Dust Status"
          value={stats.currentReading?.dustStatus || "UNKNOWN"}
          unit=""
          status={stats.currentReading?.dustStatus?.includes("DUSTY") ? "warning" : "success"}
          icon={<Droplets className="h-5 w-5" />}
          testId="card-dust-status"
        />
        <MetricCard
          title="Cleaning Servo"
          value={stats.currentReading?.sweepEnable ? "ACTIVE" : "IDLE"}
          unit=""
          status={stats.currentReading?.sweepEnable ? "success" : "normal"}
          icon={<RefreshCw className="h-5 w-5" />}
          testId="card-servo-status"
        />
      </div>

      <RealTimeSensorMonitor />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Energy Output"
          value={stats.currentReading.energyOutput.toFixed(2)}
          unit="W"
          trend={{
            value: 5.2,
            direction: "up",
          }}
          status="success"
          icon={<Zap className="h-5 w-5" />}
          testId="card-energy-output"
        />
        <MetricCard
          title="Efficiency"
          value={stats.currentReading.efficiencyPercent.toFixed(1)}
          unit="%"
          trend={{
            value: 2.1,
            direction: "down",
          }}
          status={getEfficiencyStatus(stats.currentReading.efficiencyPercent)}
          icon={<Zap className="h-5 w-5" />}
          testId="card-efficiency"
        />
        <MetricCard
          title="Sunlight Intensity"
          value={stats.currentReading.sunlightIntensity.toFixed(0)}
          unit="W/m²"
          trend={{
            value: 8.3,
            direction: "up",
          }}
          status="normal"
          icon={<Sun className="h-5 w-5" />}
          testId="card-sunlight"
        />
        <MetricCard
          title="Temperature"
          value={stats.currentReading.temperature.toFixed(1)}
          unit="°C"
          trend={{
            value: 1.5,
            direction: "up",
          }}
          status={
            stats.currentReading.temperature > 35
              ? "warning"
              : "normal"
          }
          icon={<Thermometer className="h-5 w-5" />}
          testId="card-temperature"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TimeSeriesChart
            title="Energy Output (Last 24 Hours)"
            data={chartData}
            color="hsl(var(--chart-1))"
            valueLabel="Energy (W)"
            testId="chart-energy-output"
          />
        </div>
        <div className="space-y-6">
          <EfficiencyGauge
            value={stats.currentReading.efficiencyPercent}
            label="Current Efficiency"
            testId="gauge-efficiency"
          />
          <MetricCard
            title="Dust Level"
            value={stats.currentReading.dustLevel.toFixed(1)}
            unit="/ 10"
            status={
              stats.currentReading.dustLevel > 7
                ? "error"
                : stats.currentReading.dustLevel > 5
                  ? "warning"
                  : "success"
            }
            icon={<Droplets className="h-5 w-5" />}
            testId="card-dust-level"
          />
        </div>
      </div>

      {stats.topRecommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Recommendations</h2>
            <Button variant="ghost" size="sm" data-testid="link-view-all-recommendations">
              View All
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {stats.topRecommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border bg-card p-4 space-y-2 hover-elevate"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{rec.title}</h3>
                  <span className="text-xs font-medium text-muted-foreground">
                    Impact: {rec.impactScore}/100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
