import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'; // Import PieChart components

const newGoalSchema = z.object({
  goalName: z.string().min(1, "Goal name is required"),
  targetAmount: z.string().min(1, "Target amount is required"),
  riskLevel: z.number().min(0).max(10),
  timeFrame: z.number().min(1).max(30),
});

type NewGoalFormData = z.infer<typeof newGoalSchema>;

type OptimizationResult = {
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
  plot: string;
  allocations: Record<string, number>;
};

const MUTUAL_FUND_NAMES: Record<string, string> = {
  '0P0000XVUB.BO': 'Axis Liquid Fund',
  '0P0000XV5S.BO': 'Kotak Equity Arbitrage Fund',
  '0P0000XVK2.BO': 'SBI Gilt Fund',
  '0P0000XVJK.BO': 'SBI Gold Fund',
  '0P0000XVU2.BO': 'UTI Nifty Index Fund',
  '0P0001IAU9.BO': 'MOSL Nifty Midcap 150',
};

export default function NewGoal() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [pieChartData, setPieChartData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (optimizationResult) {
      // Transform allocations data for the pie chart
      const data = Object.entries(optimizationResult.allocations).map(([symbol, value]) => ({
        name: MUTUAL_FUND_NAMES[symbol] || symbol, // Use the name if available, otherwise use the symbol
        value: value,
      }));
      setPieChartData(data);
    }
  }, [optimizationResult]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']; // Define colors for the pie chart

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    setLocation('/auth');
    return null;
  }

  const form = useForm<NewGoalFormData>({
    resolver: zodResolver(newGoalSchema),
    defaultValues: {
      goalName: "",
      targetAmount: "",
      riskLevel: 5,
      timeFrame: 10,
    },
  });

  const onSubmit = async (data: NewGoalFormData) => {
    try {
      setIsOptimizing(true);
      const response = await fetch("/api/optimize-portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          riskLevel: data.riskLevel,
          timeFrame: data.timeFrame,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Please log in again to continue");
          return;
        }
        let errorDetail = "Portfolio optimization failed";
        try {
          const errorResponse = await response.json();
          if (errorResponse.message) {
            errorDetail = errorResponse.message;
            if (errorResponse.details) {
              errorDetail += `: ${errorResponse.details}`;
            }
          }
        } catch (e) {
          // Handle JSON parsing error if the response is not valid JSON
          console.error("Failed to parse error response:", e);
          errorDetail = "Portfolio optimization failed due to an unexpected error.";
        }
        alert(errorDetail);
        return;
      }

      const result = await response.json();
      setOptimizationResult(result);
    } catch (error: any) {
      console.error("Error optimizing portfolio:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black p-8">
      <Button
        variant="ghost"
        className="text-gray-400 hover:text-white mb-8"
        onClick={() => { window.location.href = `/clients/${id}`; }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Create New Investment Goal</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="goalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Goal Purpose/Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Retirement, House, Education" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Target Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 1000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Risk Level (0-10, 10 being least risky)
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                        <div className="text-center text-white">
                          Selected Risk Level: {field.value}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeFrame"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Time Period (Years)
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Slider
                          min={1}
                          max={30}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                        <div className="text-center text-white">
                          {field.value} Years
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isOptimizing}>
                {isOptimizing ? "Optimizing Portfolio..." : "Create Goal"}
              </Button>
            </form>
          </Form>
        </Card>

        {optimizationResult && (
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
            <h2 className="text-xl font-bold text-white mb-4">Optimized Portfolio</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400">Expected Return</p>
                <p className="text-white text-xl">{optimizationResult.expected_return}%</p>
              </div>
              <div>
                <p className="text-gray-400">Volatility</p>
                <p className="text-white text-xl">{optimizationResult.volatility}%</p>
              </div>
              <div>
                <p className="text-gray-400">Sharpe Ratio</p>
                <p className="text-white text-xl">{optimizationResult.sharpe_ratio}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Portfolio Allocation</h3>
              <div className="space-y-2">
                {Object.entries(optimizationResult.allocations).map(([symbol, allocation]) => {
                  const fundName = MUTUAL_FUND_NAMES[symbol] || symbol; // Use the name if available, otherwise use the symbol
                  return (
                    <div key={symbol} className="flex justify-between">
                      <span className="text-gray-400">{fundName}</span>
                      <span className="text-white">{allocation}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Portfolio Allocation Pie Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {
                      pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                    }
                  </Pie>
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    layout="horizontal"
                    iconSize={10}
                    formatter={(value, entry, index) => (
                      <span style={{ color: 'white' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}