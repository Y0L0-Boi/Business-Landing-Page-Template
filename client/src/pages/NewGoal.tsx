import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Target } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const newGoalSchema = z.object({
  goalName: z.string().min(1, "Goal name is required"),
  targetAmount: z.string().min(1, "Target amount is required"),
  sipAmount: z.string().min(1, "Monthly SIP amount is required"),
  riskAppetite: z.string().min(1, "Risk appetite is required"),
  timeFrame: z.string().min(1, "Time frame is required"),
  initialInvestment: z.string().min(1, "Initial investment is required"),
});

type NewGoalFormData = z.infer<typeof newGoalSchema>;

export default function NewGoal() {
  const { id } = useParams();
  const form = useForm<NewGoalFormData>({
    resolver: zodResolver(newGoalSchema),
    defaultValues: {
      goalName: "",
      targetAmount: "",
      sipAmount: "",
      riskAppetite: "",
      timeFrame: "",
      initialInvestment: "",
    },
  });

  const onSubmit = async (data: NewGoalFormData) => {
    try {
      console.log("Submitting new goal:", data);
      window.location.href = `/clients/${id}`;
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black p-8">
      <Button
        variant="ghost"
        className="text-gray-400 hover:text-white mb-8"
        onClick={() => window.location.href = `/clients/${id}`}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Create New Investment Goal</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="goalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Retirement" {...field} />
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
                    <Input type="number" placeholder="e.g. 10000000" {...field} />
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
                  <FormLabel className="text-white">Time Frame (Years)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sipAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Monthly SIP Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 25000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Initial Investment (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 100000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="riskAppetite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Risk Appetite</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Create Goal</Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}