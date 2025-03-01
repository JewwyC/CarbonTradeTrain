import { Project } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>{project.name}</div>
          <div className="text-primary">${Number(project.price).toFixed(2)}</div>
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          {project.location}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{project.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-muted-foreground">Available Credits</div>
            <div className="font-medium">{Number(project.credits).toFixed(2)}</div>
          </div>
          <Link href={`/trade/${project.id}`}>
            <Button className="gap-2">
              Trade Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
