import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface LambdaAdvice {
  success: boolean;
  advice: string;
  source: string;
  timestamp: string;
  error?: string;
  fallback?: string;
}

export default function AIRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [lambdaResponse, setLambdaResponse] = useState<LambdaAdvice | null>(null);
  const { toast } = useToast();

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const getLambdaAdvice = async () => {
    setIsLoading(true);
    try {
      const currentReading = dashboardData?.currentReading;
      if (!currentReading) {
        toast({
          title: "Error",
          description: "No sensor data available",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const response = await apiRequest("POST", "/api/ai/lambda-advice", {
        voltage: 48,
        ldr_diff: Math.max(0, (currentReading.dustLevel || 0) * 100),
        dustLevel: currentReading.dustLevel || 0,
        dustStatus: currentReading.dustStatus || "UNKNOWN",
        efficiency: currentReading.efficiencyPercent || 85,
        temperature: currentReading.temperature || 30,
        energyOutput: currentReading.energyOutput || 0,
        sunlightIntensity: currentReading.sunlightIntensity || 0,
        currentLevelMA: currentReading.currentLevelMA || 0,
        powerOutputMW: currentReading.powerOutputMW || 0,
        overload: currentReading.overload || false,
        sweepEnable: currentReading.sweepEnable || false,
        autoMode: currentReading.autoMode || true,
        tiltAngle: currentReading.tiltAngle || 32,
      });

      setLambdaResponse(response);
      if (response.success) {
        toast({
          title: "AI Advice Generated",
          description: "AWS Lambda has provided real-time recommendations",
        });
      } else {
        toast({
          title: "Warning",
          description: response.fallback || "Could not fetch AI advice",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get advice from AWS Lambda",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold tracking-tight">
            AWS AI Recommendations
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Powered by AWS Lambda + Mistral AI (SouryaNova Brain)
        </p>
      </div>

      {/* Current Sensor Status */}
      {dashboardData?.currentReading && (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Current Panel Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Efficiency</p>
              <p className="text-lg font-semibold">
                {dashboardData.currentReading.efficiencyPercent.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="text-lg font-semibold">
                {dashboardData.currentReading.temperature.toFixed(1)}°C
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dust Level</p>
              <p className="text-lg font-semibold">
                {dashboardData.currentReading.dustLevel.toFixed(1)}/10
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sunlight</p>
              <p className="text-lg font-semibold">
                {dashboardData.currentReading.sunlightIntensity.toFixed(0)} W/m²
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Generate Button */}
      <Button
        onClick={getLambdaAdvice}
        disabled={isLoading}
        size="lg"
        className="w-full md:w-auto"
        data-testid="button-get-ai-advice"
      >
        {isLoading ? "Getting AI Advice..." : "Get AI Recommendations from AWS Lambda"}
      </Button>

      {/* Lambda Response */}
      {lambdaResponse && (
        <Card
          className={`p-6 space-y-4 border-l-4 ${
            lambdaResponse.success
              ? "border-l-green-600 bg-green-50 dark:bg-green-950/20"
              : "border-l-red-600 bg-red-50 dark:bg-red-950/20"
          }`}
        >
          <div className="flex items-start gap-3">
            {lambdaResponse.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {lambdaResponse.source} • {lambdaResponse.timestamp ? new Date(lambdaResponse.timestamp).toLocaleTimeString() : 'Now'}
                </p>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {lambdaResponse.advice}
                </p>
              </div>
              {lambdaResponse.error && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-800 dark:text-red-200">
                  {lambdaResponse.fallback || lambdaResponse.error}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>How it works:</strong> This page sends all your solar panel sensor data to AWS Lambda, which uses Mistral 7B AI model via HuggingFace to generate real-time optimization recommendations. Sent variables: voltage, energy output, sunlight intensity, temperature, dust level, current level, power output, efficiency, tilt angle, overload status, and operational mode.
        </p>
      </Card>

      {/* Setup Instructions */}
      <Card className="p-4 space-y-3 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">AWS Lambda + HuggingFace Setup</h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>To activate real Mistral AI recommendations from AWS Lambda:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Get HuggingFace API Key:</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Visit <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">HuggingFace Settings</a></li>
                <li>Create free account & generate API token</li>
              </ul>
            </li>
            <li><strong>Configure AWS Lambda:</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Go to AWS Lambda Console → Find "SouryaNova-Brain" function</li>
                <li>Configuration → Environment variables → Add new variable</li>
                <li>Key: <code className="bg-blue-900/20 px-2 py-1 rounded text-xs">HF_API_KEY</code></li>
                <li>Value: (paste your HuggingFace token here)</li>
                <li>Click Save</li>
              </ul>
            </li>
            <li><strong>Update Lambda Code:</strong> Replace with Python code from AWS_LAMBDA_INTEGRATION_GUIDE.md</li>
            <li><strong>Deploy:</strong> Click Deploy button in Lambda console</li>
            <li><strong>Test:</strong> Come back and click "Get AI Recommendations from AWS Lambda"</li>
          </ol>
          <p className="mt-3 p-2 bg-blue-900/20 rounded italic">
            If you haven't done this yet, the app will use intelligent local AI recommendations instead.
          </p>
        </div>
      </Card>
    </div>
  );
}
