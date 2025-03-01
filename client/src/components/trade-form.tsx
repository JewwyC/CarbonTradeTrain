import { Project } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const tradeSchema = z.object({
  amount: z.string().transform(Number).refine(val => val > 0, "Amount must be greater than 0"),
  type: z.enum(["buy", "sell"]),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  project: Project;
}

export function TradeForm({ project }: TradeFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      amount: "",
      type: "buy",
    },
  });

  const tradeMutation = useMutation({
    mutationFn: async (data: TradeFormData) => {
      const response = await apiRequest("POST", "/api/trade", {
        projectId: project.id,
        amount: data.amount.toString(),
        type: data.type,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          setLocation('/auth');
          throw new Error("Please log in again to continue");
        }
        throw new Error(errorText || "Trade failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Trade successful",
        description: "Your transaction has been processed.",
      });
      form.reset();
      setLocation('/'); // Redirect to home page after successful trade
    },
    onError: (error: Error) => {
      toast({
        title: "Trade failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TradeFormData) => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    if (data.type === "buy") {
      const totalCost = data.amount * Number(project.price);
      if (totalCost > Number(user.balance)) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough funds for this purchase.",
          variant: "destructive",
        });
        return;
      }
    }
    tradeMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="buy" />
                    </FormControl>
                    <FormLabel className="font-normal">Buy</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="sell" />
                    </FormControl>
                    <FormLabel className="font-normal">Sell</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount of Credits</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={tradeMutation.isPending}
        >
          {tradeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Trade"
          )}
        </Button>
      </form>
    </Form>
  );
}