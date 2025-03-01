import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CarbonProject, Trade } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

function TradeDialog({
  project,
  type,
}: {
  project: CarbonProject;
  type: "buy" | "sell";
}) {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const tradeMutation = useMutation({
    mutationFn: async (data: { projectId: number; amount: number; type: "buy" | "sell" }) => {
      const res = await apiRequest("POST", "/api/trades", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Trade successful",
        description: `Successfully ${type}ed ${amount} credits`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Trade failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTrade = () => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    const totalCost = numAmount * Number(project.pricePerCredit);
    if (type === "buy" && totalCost > Number(user?.credits)) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough credits for this purchase",
        variant: "destructive",
      });
      return;
    }

    tradeMutation.mutate({
      projectId: project.id,
      amount: numAmount,
      type,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={type === "buy" ? "default" : "secondary"}>
          {type === "buy" ? "Buy Credits" : "Sell Credits"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "buy" ? "Buy Credits" : "Sell Credits"}
          </DialogTitle>
          <DialogDescription>
            {project.name} - ${Number(project.pricePerCredit).toFixed(2)} per credit
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount of credits"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total cost: ${(Number(amount) * Number(project.pricePerCredit)).toFixed(2)}
          </div>
          <Button
            onClick={handleTrade}
            className="w-full"
            disabled={tradeMutation.isPending}
          >
            {tradeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Confirm ${type}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Trading() {
  const { data: projects, isLoading: projectsLoading } = useQuery<CarbonProject[]>({
    queryKey: ["/api/projects"],
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  if (projectsLoading || tradesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold">Trading Platform</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                {project.verified && (
                  <Badge variant="secondary">Verified</Badge>
                )}
              </div>
              <CardDescription>{project.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Credit</p>
                    <p className="text-lg font-semibold">
                      ${Number(project.pricePerCredit).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-lg font-semibold">
                      {Number(project.creditsAvailable).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <TradeDialog project={project} type="buy" />
                  <TradeDialog project={project} type="sell" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades?.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    {format(new Date(trade.timestamp), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.type === "buy" ? "default" : "secondary"}>
                      {trade.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{Number(trade.amount).toLocaleString()}</TableCell>
                  <TableCell>${Number(trade.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
