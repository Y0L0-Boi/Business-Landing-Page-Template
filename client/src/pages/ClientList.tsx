
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@shared/schema";
import { Indian } from "@/lib/currency";
import { Loader2 } from "lucide-react";

// Extended client type with computed fields from the backend
type ClientWithPortfolio = Client & {
  portfolioValue: number;
  fundCount: number;
};

export default function ClientList() {
  const [, setLocation] = useLocation();

  // Fetch clients data
  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients", {
        credentials: "include" // Add this to include cookies/session
      });
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      return await response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Clients</h1>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => setLocation("/clients/new")}
        >
          Add New Client
        </Button>
      </div>

      {/* Client List */}
      <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
        <div className="rounded-md border border-blue-900/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Portfolio Value</TableHead>
                <TableHead className="text-gray-300">Funds</TableHead>
                <TableHead className="text-gray-300">KYC Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(clients ?? []).map((client: ClientWithPortfolio) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => setLocation(`/clients/${client.id}`)}
                >
                  <TableCell className="font-medium text-white">
                    {client.name}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {client.email}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {Indian.format(client.portfolioValue)}
                  </TableCell>
                  <TableCell className="text-gray-300">{client.fundCount}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        client.kycStatus
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {client.kycStatus ? "Completed" : "Pending"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
