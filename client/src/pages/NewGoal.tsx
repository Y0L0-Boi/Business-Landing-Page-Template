
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
import { Slider } from "@/components/ui/slider";

const newGoalSchema = z.object({
  goalName: z.string().min(1, "Goal name is required"),
  targetAmount: z.string().min(1, "Target amount is required"),
  riskLevel: z.number().min(0).max(10),
  timeFrame: z.number().min(1).max(30),
});

type NewGoalFormData = z.infer<typeof newGoalSchema>;

export default function NewGoal() {
  const { id } = useParams();
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

            <Button type="submit" className="w-full">Create Goal</Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
