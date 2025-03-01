import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Credit } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CarbonChart } from "@/components/carbon-chart";
import { LeafIcon, TreePine, ArrowRightIcon } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: credits } = useQuery<Credit[]>({ queryKey: ["/api/credits"] });

  const totalCredits = credits?.reduce((sum, credit) => 
    credit.type === "buy" ? sum + Number(credit.amount) : sum - Number(credit.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
          <div className="flex items-center gap-4">
            <TreePine className="h-6 w-6 text-primary" />
            <span className="text-2xl font-semibold">
              Balance: ${Number(user?.balance).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LeafIcon className="h-5 w-5 text-primary" />
                Carbon Credits Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">{totalCredits.toFixed(2)}</div>
              <CarbonChart credits={credits || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {credits?.slice(-5).reverse().map((credit) => (
                  <div key={credit.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <span className={`font-semibold ${credit.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                        {credit.type === 'buy' ? 'Purchased' : 'Sold'}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {new Date(credit.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{Number(credit.amount).toFixed(2)} credits</div>
                      <div className="text-sm text-muted-foreground">
                        ${Number(credit.price).toFixed(2)} per credit
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Link href="/projects">
            <Button className="gap-2">
              View Available Projects
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
