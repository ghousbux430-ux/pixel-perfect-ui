import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Analytics } from "@/lib/humapulse-types";

const urgencyColors = ["var(--color-chart-4)", "var(--color-urgent)", "var(--color-critical)"];
const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
};

export function DemandChart({ data }: { data: Analytics["demand_by_blood_group"] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="blood_group" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="requests" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function UrgencyChart({ data }: { data: Analytics["requests_by_urgency"] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="urgency" innerRadius={70} outerRadius={110} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={urgencyColors[i % urgencyColors.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default { DemandChart, UrgencyChart };
