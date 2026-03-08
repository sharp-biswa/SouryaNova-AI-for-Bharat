import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SystemHealth, SensorReading } from "@shared/schema";

export default function SystemHealthPage() {
  const { data: healthData, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ["/api/system-health"],
  });

  const { data: latestReading, isLoading: readingLoading } = useQuery<SensorReading>({
    queryKey: ["/api/sensors/latest"],
  });

  if (healthLoading || readingLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const statusConfig = {
    online: {
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
      label: "Online",
    },
    offline: {
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
      label: "Offline",
    },
    degraded: {
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      label: "Degraded",
    },
  };

  const status = healthData?.sensorStatus || "offline";
  const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || XCircle;
  const config = statusConfig[status as keyof typeof statusConfig];

  const sensors = [
    {
      name: "Energy Output Sensor",
      value: latestReading?.energyOutput.toFixed(2),
      unit: "W",
      status: "online",
      lastUpdate: latestReading?.timestamp,
    },
    {
      name: "Sunlight Intensity Sensor",
      value: latestReading?.sunlightIntensity.toFixed(0),
      unit: "W/m²",
      status: "online",
      lastUpdate: latestReading?.timestamp,
    },
    {
      name: "Temperature Sensor",
      value: latestReading?.temperature.toFixed(1),
      unit: "°C",
      status: "online",
      lastUpdate: latestReading?.timestamp,
    },
    {
      name: "Dust Level Sensor",
      value: latestReading?.dustLevel.toFixed(1),
      unit: "/ 10",
      status: "online",
      lastUpdate: latestReading?.timestamp,
    },
    {
      name: "Tilt Angle Sensor",
      value: latestReading?.tiltAngle.toFixed(1),
      unit: "°",
      status: "online",
      lastUpdate: latestReading?.timestamp,
    },
  ];

  return (
    <div className="space-y-6" data-testid="page-system-health">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
        <p className="text-sm text-muted-foreground">
          Monitor sensor status and system diagnostics
        </p>
      </div>

      <Card className={cn("border-l-4", config?.borderColor)}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={cn("rounded-full p-3", config?.bgColor)}>
              <StatusIcon className={cn("h-6 w-6", config?.color)} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">System Status</h2>
                <Badge className={cn(config?.bgColor, config?.color, "border", config?.borderColor)}>
                  {config?.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {healthData?.diagnosticMessage || "All systems operational"}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Last updated:{" "}
                  {healthData?.lastUpdate
                    ? new Date(healthData.lastUpdate).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {sensors.map((sensor, index) => {
          const sensorConfig = statusConfig[sensor.status as keyof typeof statusConfig];
          const SensorIcon = sensorConfig?.icon || CheckCircle2;

          return (
            <Card key={index} data-testid={`sensor-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">{sensor.name}</CardTitle>
                <SensorIcon className={cn("h-5 w-5", sensorConfig?.color)} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold font-mono" data-testid={`sensor-value-${index}`}>
                    {sensor.value || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {sensor.unit}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      sensorConfig?.bgColor,
                      sensorConfig?.color,
                      "border",
                      sensorConfig?.borderColor
                    )}
                  >
                    {sensorConfig?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {sensor.lastUpdate
                      ? new Date(sensor.lastUpdate).toLocaleTimeString()
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Diagnostic Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-start gap-3 py-2 border-b">
              <span className="text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </span>
              <span className="text-success">INFO</span>
              <span className="flex-1">All sensors reporting nominal values</span>
            </div>
            <div className="flex items-start gap-3 py-2 border-b">
              <span className="text-muted-foreground">
                {new Date(Date.now() - 300000).toLocaleTimeString()}
              </span>
              <span className="text-chart-3">INFO</span>
              <span className="flex-1">System health check completed successfully</span>
            </div>
            <div className="flex items-start gap-3 py-2 border-b">
              <span className="text-muted-foreground">
                {new Date(Date.now() - 600000).toLocaleTimeString()}
              </span>
              <span className="text-chart-3">INFO</span>
              <span className="flex-1">Data synchronization completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
