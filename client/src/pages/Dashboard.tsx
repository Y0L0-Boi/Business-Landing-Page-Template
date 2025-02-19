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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Client } from "@shared/schema";
import { Indian } from "@/lib/currency";
import { Loader2, Users, TrendingUp, IndianRupee } from "lucide-react";

// Extended client type with computed fields from the backend
type ClientWithPortfolio = Client & {
  portfolioValue: number;
  fundCount: number;
};

type PortfolioSummary = {
  totalAum: number;
  totalClients: number;
  totalCommission: number;
  amountInvested: number;
  xirr: number;
  growthData: { month: string; aum: number }[];
};

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // For demonstration, using static data for clients
  const { data: clients, isLoading: isLoadingClients } = useQuery<ClientWithPortfolio[]>({
    queryKey: ["/api/clients"],
    queryFn: () =>
      Promise.resolve([
        {
          id: 1,
          name: "Ramesh Kumar",
          userId: null,
          email: "ramesh@example.com",
          phone: "+91 98765 43212",
          panNumber: "LMNOP7890Q",
          kycStatus: true,
          createdAt: null,
          portfolioValue: 6700000,
          fundCount: 6,
        },
      ]),
    initialData: [],
  });

  // For demonstration, using static data for portfolio summary
  const { data: portfolioSummary, isLoading: isLoadingSummary } = useQuery<PortfolioSummary>({
    queryKey: ["/api/portfolio/summary"],
    queryFn: () =>
      Promise.resolve({
        totalAum: 1000000000,
        totalClients: 100,
        totalCommission: 5000000,
        amountInvested: 800000000,
        xirr: 12.5,
        growthData: [
          { month: "Jan", aum: 200000000 },
          { month: "Feb", aum: 210000000 },
          { month: "Mar", aum: 220000000 },
          { month: "Apr", aum: 230000000 },
          { month: "May", aum: 240000000 },
          { month: "Jun", aum: 250000000 },
        ],
      }),
  });

  if (isLoadingClients || isLoadingSummary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Clients</p>
              <h3 className="text-2xl font-bold text-white">
                {portfolioSummary?.totalClients ?? 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total AUM</p>
              <h3 className="text-2xl font-bold text-white">
                {Indian.format(portfolioSummary?.totalAum ?? 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
          <div className="flex items-center gap-4">
            <IndianRupee className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Commission</p>
              <h3 className="text-2xl font-bold text-white">
                {Indian.format(portfolioSummary?.totalCommission ?? 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
          <div className="flex items-center gap-4">
            <IndianRupee className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Amount Invested</p>
              <h3 className="text-2xl font-bold text-white">
                {Indian.format(portfolioSummary?.amountInvested ?? 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">XIRR</p>
              <h3 className="text-2xl font-bold text-white">
                {portfolioSummary?.xirr ?? 0}%
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Portfolio Growth</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioSummary?.growthData ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                tickFormatter={(value) => Indian.format(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid #1e3a8a",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="aum"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ fill: "#60a5fa" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Client List */}
      <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Clients</h3>
          <Button 
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => setLocation("/clients/new")}
          >
            Add New Client
          </Button>
        </div>

        <div className="rounded-md border border-blue-900/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Name</TableHead>
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