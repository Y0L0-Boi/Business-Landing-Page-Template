import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query"; // Added import for react-query

const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.string().min(1, "Age is required").refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, "Age must be a valid number"),
  panNumber: z.string().min(10, "Valid PAN number is required"),
  riskAppetite: z.string().min(0, "Risk appetite is required").refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 10;
  }, "Risk Appetite must be a number between 0 and 10"),
  profession: z.string().min(1, "Profession is required"),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export default function NewClient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Added to use react-query

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      age: "",
      panNumber: "",
      riskAppetite: "",
      profession: "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          age: parseInt(data.age),
          panNumber: data.panNumber,
          riskAppetite: parseInt(data.riskAppetite),
          profession: data.profession,
          kycStatus: true,
        }),
      });

      if (!response.ok) {
        console.log(response)
        throw new Error("Failed to create client");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/clients"] }); //Invalidate queries here

      toast({
        title: "Success",
        description: "Client registered successfully",
      });
      setLocation("/dashboard");
    } catch (error:any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register client. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black p-8">
      <Button
        variant="ghost"
        className="mb-6 text-white"
        onClick={() => setLocation("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
        <h1 className="text-2xl font-bold text-white mb-6">Register New Client</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter age" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="panNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">PAN Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter PAN number" {...field} />
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
                  <FormLabel className="text-white">Risk Appetite (0-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      placeholder="Enter risk appetite"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Profession</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter profession" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
              Register Client
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}