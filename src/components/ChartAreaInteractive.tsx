"use client";

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const description =
  "An interactive area chart with the project's uptime.";

const chartConfig = {
  status: {
    label: "Status",
    color: "var(--color-cyan-500)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  projectHistory,
}: {
  projectHistory: {
    id: number;
    status: number;
    lastChecked: string;
  }[];
}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("90d");

  useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = projectHistory.filter((item) => {
    const date = new Date(item.lastChecked);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="grow bg-cyan-800/40 backdrop-blur-lg">
      <CardHeader>
        <CardTitle>Uptime</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the{" "}
            {timeRange === "7d"
              ? "last week"
              : timeRange === "30d"
              ? "last month"
              : "last 3 months"}
          </span>
          <span className="@[540px]/card:hidden">
            {timeRange === "7d"
              ? "Last Week"
              : timeRange === "30d"
              ? "Last Month"
              : "Last 3 Months"}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">Last week</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last month</ToggleGroupItem>
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillStatus" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-status)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-status)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="lastChecked"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  timeZone: "Europe/Bucharest",
                  month: "short",
                  day: "numeric",
                  hour12: false,
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={<TooltipPayloadMapper />}
            />
            <Area
              dataKey="status"
              type="natural"
              fill="url(#fillStatus)"
              stroke="var(--color-status)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function TooltipPayloadMapper(
  props: ComponentProps<typeof Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
) {
  const { payload, ...rest } = props;

  const mappedPayload = useMemo(
    () =>
      payload?.map((item) => ({
        ...item,
        value:
          item.value === 0.2
            ? "Down"
            : item.value === 1
            ? "Active"
            : item.value,
      })),
    [payload]
  );

  return (
    <ChartTooltipContent
      {...rest}
      payload={mappedPayload}
      labelFormatter={(value) => {
        return new Date(value).toLocaleDateString("en-US", {
          timeZone: "Europe/Bucharest",
          month: "short",
          day: "numeric",
          hour12: false,
        });
      }}
      indicator="dot"
    />
  );
}
