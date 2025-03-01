import { Credit } from "@shared/schema";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface CarbonChartProps {
  credits: Credit[];
}

export function CarbonChart({ credits }: CarbonChartProps) {
  const data = credits.reduce((acc: any[], credit) => {
    const amount = Number(credit.amount);
    const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    return [...acc, {
      date: new Date(credit.timestamp).toLocaleDateString(),
      balance: credit.type === 'buy' ? lastBalance + amount : lastBalance - amount,
    }];
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="carbon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#carbon)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
