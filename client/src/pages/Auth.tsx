import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LogIn, UserPlus, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WavePattern from "@/components/ui/patterns/WavePattern";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: AuthFormData) => {
    toast({
      title: isLogin ? "Logging in..." : "Creating account...",
      description: "Please wait while we process your request.",
    });
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black relative overflow-hidden">
      <WavePattern className="opacity-30" />
      
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
                  >
                    {isLogin ? (
                      <><LogIn className="mr-2 h-4 w-4" /> Login</>
                    ) : (
                      <><UserPlus className="mr-2 h-4 w-4" /> Register</>
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
                <Shield className="w-8 h-8 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Compliance Ready</h3>
                  <p className="text-gray-300">
                    Stay compliant with all SEBI regulations and requirements
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
