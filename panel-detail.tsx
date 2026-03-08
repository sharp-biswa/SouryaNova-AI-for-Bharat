import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Activity, Zap, Thermometer, Wind, AlertCircle, TrendingUp, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PanelDetailPage() {
  const [, params] = useRoute("/panels/:id");
  const panelId = params?.id;

  const { data: panelData, isLoading, error } = useQuery<any>({
    queryKey: [`/api/panels/${panelId}`],
    enabled: !!panelId,
    refetchInterval: 1000, // Refetch every 1 second for real-time dust level
  });

  const { data: historyData } = useQuery<{ readings: any[] }>({
    queryKey: [`/api/dashboard/history?panelId=${panelId}&range=24`],
    enabled: !!panelId,
  });

  const { data: predictions } = useQuery<any>({
    queryKey: [`/api/predictions/forecast?panelId=${panelId}`],
    enabled: !!panelId,
  });

  const { data: recommendationsData } = useQuery<{ recommendations: any[] }>({
    queryKey: [`/api/recommendations?panelId=${panelId}`],
    enabled: !!panelId,
  });

  if (error || (!isLoading && !panelData)) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Panel Not Found</h2>
          <p className="text-muted-foreground">The requested panel could not be found</p>
          <Link href="/panels">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Panels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading panel details...</p>
        </div>
      </div>
    );
  }

  const panel = panelData;
  const latestReading = panelData.currentReading;
  const recentReadings = panelData.recentReadings || [];
  const recommendations = recommendationsData?.recommendations || [];

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-chart-3';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'maintenance': return 'bg-warning/10 text-warning border-warning/20';
      case 'offline': return 'bg-muted text-muted-foreground border-border';
      case 'damaged': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const chartData = (historyData?.readings || recentReadings).map((r: any) => ({
    time: r.timestamp ? format(new Date(r.timestamp), 'HH:mm') : '--:--',
    energy: r.energyOutput,
    efficiency: r.efficiencyPercent,
    temperature: r.temperature,
    dust: r.dustLevel,
  }));

  return (
    <div className="flex flex-col min-h-full p-6 gap-6">
      <div className="flex items-center gap-4">
        <Link href="/panels">
          <Button variant="outline" size="icon" data-testid="button-back-to-panels">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-panel-detail">
            Panel {panel.panelNumber}
          </h1>
          <p className="text-muted-foreground mt-1">{panel.location}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("capitalize", getStatusColor(panel.status))}
          data-testid="badge-panel-status"
        >
          {panel.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground uppercase flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className={cn("text-3xl font-bold font-mono", getHealthColor(panel.healthScore))} data-testid="text-health-score">
                {panel.healthScore.toFixed(1)}%
              </p>
              <Progress value={panel.healthScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {latestReading && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Energy Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono" data-testid="text-energy-output">
                  {latestReading.energyOutput.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">mWatt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono" data-testid="text-efficiency">
                  {latestReading.efficiencyPercent.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Current</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono" data-testid="text-temperature">
                  {latestReading.temperature.toFixed(1)}°C
                </p>
                <p className="text-sm text-muted-foreground">
                  {latestReading.temperature > 35 ? 'Above optimal' : 'Normal'}
                </p>
              </CardContent>
            </Card>

            <Card className={cn(latestReading.dustLevel >= 70 && "border-destructive")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Dust Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-3xl font-bold font-mono", latestReading.dustLevel >= 70 ? "text-destructive" : "text-foreground")} data-testid="text-dust-level">
                  {latestReading.dustLevel.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {latestReading.dustLevel >= 70 ? 'Warning: High' : 'Normal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Current Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono" data-testid="text-current-level">
                  {latestReading.currentLevelMA?.toFixed(1) || "0.0"} mA
                </p>
                <p className="text-sm text-muted-foreground">Real-time</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {latestReading && latestReading.dustLevel >= 70 && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive animate-pulse" data-testid="warning-dust-cleaning">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Automatic Cleaning Initiated</p>
            <p className="text-sm">Dust level is at {latestReading.dustLevel.toFixed(1)}%. Cleaning in progress.</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          <TabsTrigger value="predictions" data-testid="tab-predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations" data-testid="tab-recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Sensor Readings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestReading ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Energy Output</span>
                      <span className="font-semibold font-mono">{latestReading.energyOutput.toFixed(2)} mW</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sunlight Intensity</span>
                      <span className="font-semibold font-mono">{latestReading.sunlightIntensity.toFixed(1)} W/m²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="font-semibold font-mono">{latestReading.temperature.toFixed(1)} °C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Dust Level</span>
                      <span className={cn("font-semibold font-mono", latestReading.dustLevel >= 70 ? "text-destructive" : "text-foreground")}>
                        {latestReading.dustLevel.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Level</span>
                      <span className="font-semibold font-mono">{latestReading.currentLevelMA?.toFixed(1) || "0.0"} mA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tilt Angle</span>
                      <span className="font-semibold font-mono">{latestReading.tiltAngle.toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Efficiency</span>
                      <span className="font-semibold font-mono">{latestReading.efficiencyPercent.toFixed(1)}%</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Last updated: {latestReading.timestamp ? format(new Date(latestReading.timestamp), 'PPpp') : 'N/A'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent readings available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Panel Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Panel ID</span>
                  <span className="font-semibold font-mono text-sm">{panel.id.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Panel Number</span>
                  <span className="font-semibold font-mono">#{panel.panelNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-semibold">{panel.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={cn("capitalize", getStatusColor(panel.status))}>
                    {panel.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className={cn("font-semibold font-mono", getHealthColor(panel.healthScore))}>
                    {panel.healthScore.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Installed</span>
                  <span className="font-semibold">
                    {panel.installedAt ? format(new Date(panel.installedAt), 'PP') : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Energy Output (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.25} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="hsl(var(--chart-1))"
                      fillOpacity={1}
                      fill="url(#energyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Trend (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.25} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.25} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line type="monotone" dataKey="temperature" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dust Level (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="dustGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.25} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="dust"
                      stroke="hsl(var(--chart-4))"
                      fillOpacity={1}
                      fill="url(#dustGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              {predictions ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Predicted Efficiency</p>
                      <p className="text-2xl font-bold font-mono">{predictions.predictedEfficiency.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Degradation Risk</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          predictions.degradationRisk === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          predictions.degradationRisk === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-success/10 text-success border-success/20'
                        )}
                      >
                        {predictions.degradationRisk}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold font-mono">{(predictions.confidenceScore * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Prediction generated at: {predictions.timestamp ? format(new Date(predictions.timestamp), 'PPpp') : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Loading predictions...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-4">
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec: any) => (
                <Card key={rec.id} data-testid={`card-recommendation-${rec.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            rec.urgency === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            rec.urgency === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-chart-3/10 text-chart-3 border-chart-3/20'
                          )}
                        >
                          {rec.urgency}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {rec.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold">Impact Score</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Progress value={rec.impactScore} className="h-2" />
                          <span className="text-sm font-mono">{rec.impactScore}/100</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-sm font-semibold mb-1">AI Explanation</p>
                        <p className="text-sm text-muted-foreground">{rec.aiExplanation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No recommendations at this time</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
