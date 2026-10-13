import { Badge } from "@/components/ui/badge";
import { priorityTone, statusTone } from "@/lib/status";
import { cn } from "cn";

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={cn("border", statusTone(value))}>
      {value}
    </Badge>
  );
}

export function PriorityBadge({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={cn("border", priorityTone(value))}>
      {value}
    </Badge>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="flex min-w-36 items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#262A36]">
        <div className="h-full rounded-full bg-[#6366F1]" style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs text-[#8B91A7] tabular-nums">{value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span>
    </div>
  );
}
