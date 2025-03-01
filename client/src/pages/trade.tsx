import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { TradeForm } from "@/components/trade-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Trade({ params }: { params: { id: string } }) {
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${params.id}`],
  });

  if (isLoading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Trade Carbon Credits - {project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <img
                src={project.imageUrl}
                alt={project.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <p className="text-muted-foreground">{project.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Location</span>
                  <p className="font-medium">{project.location}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Price per Credit</span>
                  <p className="font-medium">${Number(project.price).toFixed(2)}</p>
                </div>
              </div>
            </div>
            <TradeForm project={project} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
