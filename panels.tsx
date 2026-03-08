import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Grid3x3, List, ChevronDown, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Panel = {
  id: string;
  panelNumber: number;
  location: string;
  status: 'active' | 'maintenance' | 'offline' | 'damaged';
  healthScore: number;
  currentReading?: {
    energyOutput: number;
    efficiencyPercent: number;
    temperature: number;
    dustLevel: number;
    currentLevelMA: number;
  };
};

type PanelSummary = {
  total: number;
  active: number;
  maintenance: number;
  offline: number;
  damaged: number;
  averageHealth: number;
  averageEfficiency: number;
};

export default function PanelsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('number');

  const { data, isLoading, error } = useQuery<{ panels: Panel[]; summary: PanelSummary }>({
    queryKey: ['/api/panels'],
    refetchInterval: 1000, // Refetch every 1 second for real-time panel grid updates
  });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load panels</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  const panels = data?.panels || [];
  const summary = data?.summary;

  // Filter panels
  let filteredPanels = panels.filter(panel => {
    const matchesSearch = 
      panel.panelNumber.toString().includes(searchQuery) ||
      panel.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || panel.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort panels
  filteredPanels = [...filteredPanels].sort((a, b) => {
    switch (sortBy) {
      case 'number':
        return a.panelNumber - b.panelNumber;
      case 'health-asc':
        return a.healthScore - b.healthScore;
      case 'health-desc':
        return b.healthScore - a.healthScore;
      case 'efficiency':
        return (b.currentReading?.efficiencyPercent || 0) - (a.currentReading?.efficiencyPercent || 0);
      default:
        return 0;
    }
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-chart-3';
    if (score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
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

  return (
    <div className="flex flex-col min-h-full p-6 gap-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-panels">
              Solar Panels
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor all {panels.length} panels across the farm
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              data-testid="button-view-grid"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono" data-testid="stat-total-panels">{summary.total}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono text-success" data-testid="stat-active-panels">{summary.active}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase">Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono text-warning" data-testid="stat-maintenance-panels">{summary.maintenance}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase">Offline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono text-muted-foreground" data-testid="stat-offline-panels">{summary.offline}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase">Avg Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono" data-testid="stat-avg-health">{summary.averageHealth.toFixed(0)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase">Avg Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono" data-testid="stat-avg-efficiency">{summary.averageEfficiency.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by panel number or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-panels"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Panel Number</SelectItem>
              <SelectItem value="health-desc">Health (High to Low)</SelectItem>
              <SelectItem value="health-asc">Health (Low to High)</SelectItem>
              <SelectItem value="efficiency">Efficiency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading panels...</p>
            </div>
          </div>
        ) : filteredPanels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No panels found matching your filters</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4">
            {filteredPanels.map((panel) => (
              <Link key={panel.id} href={`/panels/${panel.id}`}>
                <Card 
                  className="hover-elevate active-elevate-2 cursor-pointer h-full"
                  data-testid={`card-panel-${panel.panelNumber}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg font-bold font-mono">
                          Panel {panel.panelNumber}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{panel.location}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("capitalize text-xs", getStatusColor(panel.status))}
                        data-testid={`badge-status-${panel.panelNumber}`}
                      >
                        {panel.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Health Score</span>
                        <span className="font-semibold">{panel.healthScore.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn("h-2 rounded-full transition-all", getHealthColor(panel.healthScore))}
                          style={{ width: `${panel.healthScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        {getHealthLabel(panel.healthScore)}
                      </p>
                    </div>
                    
                    {panel.currentReading && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Power</p>
                          <p className="text-sm font-semibold font-mono">
                            {panel.currentReading.energyOutput.toFixed(1)}mW
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Efficiency</p>
                          <p className="text-sm font-semibold font-mono">
                            {panel.currentReading.efficiencyPercent.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Temp</p>
                          <p className="text-sm font-semibold font-mono">
                            {panel.currentReading.temperature.toFixed(1)}°C
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dust</p>
                          <p className="text-sm font-semibold font-mono">
                            {panel.currentReading.dustLevel.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current</p>
                          <p className="text-sm font-semibold font-mono">
                            {panel.currentReading.currentLevelMA?.toFixed(1) || "0.0"}mA
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {filteredPanels.map((panel) => (
              <Link key={panel.id} href={`/panels/${panel.id}`}>
                <Card 
                  className="hover-elevate active-elevate-2 cursor-pointer"
                  data-testid={`row-panel-${panel.panelNumber}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-20">
                        <p className="text-lg font-bold font-mono">#{panel.panelNumber}</p>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">{panel.location}</p>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn("capitalize flex-shrink-0", getStatusColor(panel.status))}
                      >
                        {panel.status}
                      </Badge>

                      <div className="flex items-center gap-2 flex-shrink-0 w-32">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full transition-all", getHealthColor(panel.healthScore))}
                            style={{ width: `${panel.healthScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold font-mono w-12 text-right">
                          {panel.healthScore.toFixed(0)}%
                        </span>
                      </div>

                      {panel.currentReading && (
                        <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Power</p>
                            <p className="text-sm font-semibold font-mono">
                              {panel.currentReading.energyOutput.toFixed(1)}mW
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Efficiency</p>
                            <p className="text-sm font-semibold font-mono">
                              {panel.currentReading.efficiencyPercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}

                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 -rotate-90" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
