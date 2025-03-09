
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, Users, Shield, LogIn, Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const authSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(values.username, values.password);
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
        });
        setLocation("/dashboard");
      } else {
        // Register functionality
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: values.username,
            password: values.password,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Registration failed: ${response.status} ${response.statusText}`
          );
        }

        toast({
          title: "Success",
          description: "Account created successfully. You can now log in.",
        });
        setIsLogin(true); // Switch to login form after successful registration
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black">
      <div className="container mx-auto px-6 py-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 bg-white/5 backdrop-blur-lg border-blue-900/50">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-gray-300">
                  {isLogin
                    ? "Login to access your mutual fund dashboard"
                    : "Register to start managing your mutual fund business"}
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-white/10 border-blue-900/50 text-white"
                            placeholder="Enter your username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="bg-white/10 border-blue-900/50 text-white"
                            placeholder="Enter your password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isLogin ? "Logging in..." : "Creating account..."}
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        {isLogin ? "Login" : "Create Account"}
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {isLogin
                    ? "Don't have an account? Register"
                    : "Already have an account? Login"}
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white space-y-8 hidden md:block"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                MF<span className="text-blue-400">Hub</span>
              </h1>
              <p className="text-xl text-gray-300">
                Your Complete Mutual Fund Distribution Platform
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <TrendingUp className="w-8 h-8 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Portfolio Management</h3>
                  <p className="text-gray-300">
                    Track and manage your clients' mutual fund portfolios with ease
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Users className="w-8 h-8 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Client Management</h3>
                  <p className="text-gray-300">
                    Maintain a comprehensive database of all your clients
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Shield className="w-8 h-8 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Compliant</h3>
                  <p className="text-gray-300">
                    Built with industry-standard security and regulatory compliance
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
