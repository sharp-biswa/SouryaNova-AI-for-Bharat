
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Percent } from "lucide-react";

export default function CostAnalysis() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/analytics/cost-benefit"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const analysis = data?.monthlyAnalysis;
  const recommendations = data?.recommendations;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost-Benefit Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Financial impact of solar panel maintenance and optimization
        </p>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-elevate transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Potential Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ₹{analysis?.potentialRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              At optimal efficiency
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actual Monthly Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              ₹{analysis?.actualRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current generation
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all duration-300 border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Energy Loss (Monthly)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">
              ₹{analysis?.energyLoss.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Due to inefficiency
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cleaning Cost
            </CardTitle>
            <Calendar className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ₹{analysis?.cleaningCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recommendations?.optimalCleaningFrequency}x cleanings/month recommended
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all duration-300 border-success/50 bg-success/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Monthly Savings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              ₹{analysis?.netSavings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              After cleaning costs
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI on Maintenance
            </CardTitle>
            <Percent className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-chart-2">
              {analysis?.roi}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Return on investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Annual Projection */}
      <Card className="hover-elevate transition-all duration-300">
        <CardHeader>
          <CardTitle>Annual Projection</CardTitle>
          <CardDescription>
            Estimated yearly financial impact with recommended maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Estimated Annual Savings
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                With optimal cleaning schedule
              </p>
            </div>
            <div className="text-3xl font-bold font-mono text-success">
              ₹{recommendations?.estimatedAnnualSavings.toFixed(2)}
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 AI Recommendation
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Based on current performance and weather patterns, implementing a cleaning schedule of{" "}
              <strong>{recommendations?.optimalCleaningFrequency} times per month</strong> will maximize
              your return on investment. This balance ensures optimal efficiency while minimizing
              maintenance costs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
