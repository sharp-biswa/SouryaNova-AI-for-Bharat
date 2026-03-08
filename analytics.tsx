import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesChart } from "@/components/time-series-chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { AnalyticsData, HistoricalData } from "@shared/schema";

export default function Analytics() {
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const { data: historicalData, isLoading: historyLoading } = useQuery<HistoricalData>({
    queryKey: ["/api/dashboard/history"],
  });

  const efficiencyTrendData = historicalData?.readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: reading.efficiencyPercent,
  })) || [];

  const temperatureTrendData = historicalData?.readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: reading.temperature,
  })) || [];

  if (analyticsLoading || historyLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Predictive Analytics</h1>
        <div className="grid gap-6">
          <div className="h-96 bg-card animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const totalRisk = Object.values(analyticsData.degradationRiskSummary).reduce((a, b) => a + b, 0);
  const highRiskPercent = totalRisk > 0 
    ? (analyticsData.degradationRiskSummary.high / totalRisk) * 100 
    : 0;

  return (
    <div className="space-y-6" data-testid="page-analytics">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Predictive Analytics</h1>
        <p className="text-sm text-muted-foreground">
          AI-powered performance forecasting and degradation risk assessment
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Low Risk Days
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-success" data-testid="metric-low-risk">
              {analyticsData.degradationRiskSummary.low}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimal performance predicted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Medium Risk Days
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-warning" data-testid="metric-medium-risk">
              {analyticsData.degradationRiskSummary.medium}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monitor closely
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              High Risk Days
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-destructive" data-testid="metric-high-risk">
              {analyticsData.degradationRiskSummary.high}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Action required
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart
          title="Efficiency Trend"
          data={efficiencyTrendData}
          color="hsl(var(--chart-3))"
          valueLabel="Efficiency %"
          testId="chart-efficiency-trend"
        />
        <TimeSeriesChart
          title="Temperature Trend"
          data={temperatureTrendData}
          color="hsl(var(--chart-4))"
          valueLabel="Temperature °C"
          testId="chart-temperature-trend"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            7-Day Performance Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.predictions.slice(0, 7).map((prediction, index) => {
              const date = new Date(prediction.predictedDate);
              const riskColors = {
                low: "bg-success/10 text-success border-success/20",
                medium: "bg-warning/10 text-warning border-warning/20",
                high: "bg-destructive/10 text-destructive border-destructive/20",
              };

              return (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                  data-testid={`prediction-${index}`}
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {date.toLocaleDateString([], {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono font-bold">
                        {prediction.predictedEfficiency.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Efficiency
                      </div>
                    </div>
                    <Badge
                      className={
                        riskColors[prediction.degradationRisk as keyof typeof riskColors]
                      }
                    >
                      {prediction.degradationRisk.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {highRiskPercent > 30 && (
        <Card className="border-l-4 border-l-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">
                  High Risk Alert
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {highRiskPercent.toFixed(0)}% of forecasted days show high degradation risk.
                  Consider scheduling maintenance or implementing recommended optimizations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
