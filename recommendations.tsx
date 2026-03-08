import { useQuery, useMutation } from "@tanstack/react-query";
import { RecommendationCard } from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Recommendation } from "@shared/schema";

export default function Recommendations() {
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ recommendations: Recommendation[] }>({
    queryKey: ["/api/recommendations"],
  });

  const recommendations = data?.recommendations || [];

  const implementMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/recommendations/${id}/implement`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Success",
        description: "Recommendation marked as implemented",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Smart Recommendations</h1>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = recommendations.filter((rec) => {
    if (urgencyFilter !== "all" && rec.urgency !== urgencyFilter) return false;
    if (typeFilter !== "all" && rec.type !== typeFilter) return false;
    return true;
  });

  const sortedRecommendations = [...filtered].sort((a, b) => {
    const urgencyOrder = { high: 3, medium: 2, low: 1 };
    const urgencyDiff =
      urgencyOrder[b.urgency as keyof typeof urgencyOrder] -
      urgencyOrder[a.urgency as keyof typeof urgencyOrder];
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.impactScore - a.impactScore;
  });

  const stats = {
    total: recommendations.length,
    high: recommendations.filter((r) => r.urgency === "high").length,
    implemented: recommendations.filter((r) => r.implemented).length,
  };

  return (
    <div className="space-y-6" data-testid="page-recommendations">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Smart Recommendations</h1>
        <p className="text-sm text-muted-foreground">
          AI-powered optimization suggestions ranked by impact and urgency
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {stats.total} Total
          </Badge>
          <Badge
            variant="outline"
            className="text-sm bg-destructive/10 text-destructive border-destructive/20"
          >
            {stats.high} High Priority
          </Badge>
          <Badge
            variant="outline"
            className="text-sm bg-success/10 text-success border-success/20"
          >
            {stats.implemented} Implemented
          </Badge>
        </div>
        <div className="ml-auto flex gap-2">
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-[140px]" data-testid="filter-urgency">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]" data-testid="filter-type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="tilt_adjustment">Tilt Adjustment</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="optimization">Optimization</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedRecommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1">No recommendations found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Your system is performing optimally. Check back later for new suggestions.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onImplement={(id) => implementMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
