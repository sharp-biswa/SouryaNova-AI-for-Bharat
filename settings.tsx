import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AutoTiltSettings } from "@shared/schema";

export default function Settings() {
  const [threshold, setThreshold] = useState([75]);
  const [autoClean, setAutoClean] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const { data: autoTiltSettings } = useQuery<AutoTiltSettings>({
    queryKey: ['/api/settings/auto-tilt'],
  });

  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltMode, setTiltMode] = useState<'time_based' | 'ai_optimized' | 'manual'>('time_based');
  const [minAngle, setMinAngle] = useState([15]);
  const [maxAngle, setMaxAngle] = useState([60]);
  const [adjustmentInterval, setAdjustmentInterval] = useState([60]);
  const [useWeather, setUseWeather] = useState(true);
  const [aggressiveness, setAggressiveness] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  useEffect(() => {
    if (autoTiltSettings) {
      setTiltEnabled(autoTiltSettings.enabled);
      setTiltMode(autoTiltSettings.mode as 'time_based' | 'ai_optimized' | 'manual');
      setMinAngle([autoTiltSettings.minTiltAngle]);
      setMaxAngle([autoTiltSettings.maxTiltAngle]);
      setAdjustmentInterval([autoTiltSettings.adjustmentInterval]);
      setUseWeather(autoTiltSettings.useWeatherData);
      setAggressiveness(autoTiltSettings.aggressiveness as 'conservative' | 'moderate' | 'aggressive');
    }
  }, [autoTiltSettings]);

  const updateTiltMutation = useMutation({
    mutationFn: async (settings: Partial<AutoTiltSettings>) => {
      return await apiRequest('PUT', '/api/settings/auto-tilt', settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/auto-tilt'] });
      toast({
        title: "Auto-tilt settings saved",
        description: "Your auto-tilt preferences have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save auto-tilt settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleSaveTilt = () => {
    updateTiltMutation.mutate({
      enabled: tiltEnabled,
      mode: tiltMode,
      minTiltAngle: minAngle[0],
      maxTiltAngle: maxAngle[0],
      adjustmentInterval: adjustmentInterval[0],
      useWeatherData: useWeather,
      aggressiveness,
    });
  };

  return (
    <div className="space-y-6" data-testid="page-settings">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure system preferences and automation thresholds
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Performance Thresholds</CardTitle>
            <CardDescription>
              Set alert thresholds for system performance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="efficiency-threshold">Efficiency Alert Threshold</Label>
                <span className="text-sm font-mono font-bold">{threshold[0]}%</span>
              </div>
              <Slider
                id="efficiency-threshold"
                value={threshold}
                onValueChange={setThreshold}
                min={50}
                max={95}
                step={5}
                className="w-full"
                data-testid="slider-threshold"
              />
              <p className="text-xs text-muted-foreground">
                Alert when efficiency drops below this threshold
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation Settings</CardTitle>
            <CardDescription>
              Configure automatic cleaning and maintenance actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-clean">Automatic Cleaning</Label>
                <p className="text-xs text-muted-foreground">
                  Trigger cleaning when dust levels exceed threshold
                </p>
              </div>
              <Switch
                id="auto-clean"
                checked={autoClean}
                onCheckedChange={setAutoClean}
                data-testid="switch-auto-clean"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Alert Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive real-time notifications for critical alerts
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto Tilt Angle Settings</CardTitle>
            <CardDescription>
              Configure automatic tilt angle adjustments for optimal sunlight capture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-tilt-enabled">Enable Auto Tilt</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically adjust panel tilt angle based on AI recommendations
                </p>
              </div>
              <Switch
                id="auto-tilt-enabled"
                checked={tiltEnabled}
                onCheckedChange={setTiltEnabled}
                data-testid="switch-auto-tilt"
              />
            </div>

            {tiltEnabled && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="tilt-mode">Adjustment Mode</Label>
                  <Select value={tiltMode} onValueChange={(value) => setTiltMode(value as typeof tiltMode)}>
                    <SelectTrigger id="tilt-mode" data-testid="select-tilt-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time_based">Time-Based (Solar Position)</SelectItem>
                      <SelectItem value="ai_optimized">AI-Optimized (Machine Learning)</SelectItem>
                      <SelectItem value="manual">Manual Control</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {tiltMode === 'time_based' && 'Adjusts based on time of day and sun position'}
                    {tiltMode === 'ai_optimized' && 'Uses AI predictions for optimal angle adjustments'}
                    {tiltMode === 'manual' && 'Manual control with suggested angles'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="min-angle">Minimum Tilt Angle</Label>
                    <span className="text-sm font-mono font-bold">{minAngle[0]}°</span>
                  </div>
                  <Slider
                    id="min-angle"
                    value={minAngle}
                    onValueChange={setMinAngle}
                    min={0}
                    max={45}
                    step={5}
                    className="w-full"
                    data-testid="slider-min-angle"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="max-angle">Maximum Tilt Angle</Label>
                    <span className="text-sm font-mono font-bold">{maxAngle[0]}°</span>
                  </div>
                  <Slider
                    id="max-angle"
                    value={maxAngle}
                    onValueChange={setMaxAngle}
                    min={30}
                    max={90}
                    step={5}
                    className="w-full"
                    data-testid="slider-max-angle"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="adjustment-interval">Adjustment Interval</Label>
                    <span className="text-sm font-mono font-bold">{adjustmentInterval[0]} min</span>
                  </div>
                  <Slider
                    id="adjustment-interval"
                    value={adjustmentInterval}
                    onValueChange={setAdjustmentInterval}
                    min={15}
                    max={180}
                    step={15}
                    className="w-full"
                    data-testid="slider-interval"
                  />
                  <p className="text-xs text-muted-foreground">
                    How often to check and adjust tilt angle
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="aggressiveness">Adjustment Aggressiveness</Label>
                  <Select value={aggressiveness} onValueChange={(value) => setAggressiveness(value as typeof aggressiveness)}>
                    <SelectTrigger id="aggressiveness" data-testid="select-aggressiveness">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (Minimal changes)</SelectItem>
                      <SelectItem value="moderate">Moderate (Balanced)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Maximum optimization)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="use-weather">Use Weather Data</Label>
                    <p className="text-xs text-muted-foreground">
                      Factor in weather forecasts for angle adjustments
                    </p>
                  </div>
                  <Switch
                    id="use-weather"
                    checked={useWeather}
                    onCheckedChange={setUseWeather}
                    data-testid="switch-weather"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleSaveTilt} 
                    disabled={updateTiltMutation.isPending}
                    data-testid="button-save-tilt"
                  >
                    {updateTiltMutation.isPending ? 'Saving...' : 'Save Tilt Settings'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} data-testid="button-save-settings">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
