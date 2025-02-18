import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Indian } from "@/lib/currency";
import { Loader2, Target, Plus, TrendingUp, IndianRupee } from "lucide-react";

// Sample goal-based investment data for Ramesh
const sampleGoals = [
  {
    id: 1,
    name: "Retirement",
    targetAmount: 10000000,
    currentValue: 2500000,
    targetDate: "2045",
    allocatedFunds: [
      { name: "HDFC Balanced Advantage Fund", amount: 1500000 },
      { name: "ICICI Prudential Value Discovery Fund", amount: 1000000 }
    ]
  },
  {
    id: 2,
    name: "Child's Education",
    targetAmount: 5000000,
    currentValue: 1200000,
    targetDate: "2035",
    allocatedFunds: [
      { name: "Axis Long Term Equity Fund", amount: 700000 },
      { name: "SBI Blue Chip Fund", amount: 500000 }
    ]
  },
  {
    id: 3,
    name: "Home Purchase",
    targetAmount: 8000000,
    currentValue: 3000000,
    targetDate: "2030",
    allocatedFunds: [
      { name: "Kotak Equity Hybrid Fund", amount: 1800000 },
      { name: "Mirae Asset Large Cap Fund", amount: 1200000 }
    ]
  }
];

export default function ClientDashboard() {
  const { id } = useParams();

  // In a real app, this would fetch from the API
  const { data: client, isLoading } = useQuery({
    queryKey: ["/api/clients", id],
    queryFn: async () => ({
      id: 1,
      name: "Ramesh Kumar",
      email: "ramesh@example.com",
      phone: "+91 98765 43212",
      panNumber: "LMNOP7890Q",
      kycStatus: true,
      totalInvestment: 6700000,
      amountInvested: 5800000,
      xirr: 15.7,
      goals: sampleGoals
    })
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
      {/* Client Summary */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{client?.name}</h1>
          <p className="text-gray-400">PAN: {client?.panNumber}</p>
        </div>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => window.location.href = `/clients/${id}/goals/new`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Goal
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Investment Value</p>
              <h3 className="text-2xl font-bold text-white">
                {Indian.format(client?.totalInvestment || 0)}
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
                {Indian.format(client?.amountInvested || 0)}
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
                {client?.xirr || 0}%
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Target className="mr-2 h-5 w-5" />
          Investment Goals
        </h2>
        
        {client?.goals.map((goal) => (
          <Card 
            key={goal.id}
            className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50"
          >
            <div className="mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {goal.name}
                  </h3>
                  <p className="text-gray-400">Target Year: {goal.targetDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Progress</p>
                  <p className="text-xl font-bold text-white">
                    {Indian.format(goal.currentValue)} / {Indian.format(goal.targetAmount)}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{
                    width: `${(goal.currentValue / goal.targetAmount) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Allocated Funds Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Fund Name</TableHead>
                  <TableHead className="text-right text-gray-300">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goal.allocatedFunds.map((fund, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-white">
                      {fund.name}
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {Indian.format(fund.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ))}
      </div>
    </div>
  );
}
