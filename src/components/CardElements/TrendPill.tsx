import { cn } from "../../utils/utils";
import LoadingBlock from "./LoadingBlock";

interface TrendPillProps {
  loading: boolean;
  isDecrement: boolean;
  percentage: number;
  showYoY?: boolean;
}

const TrendPill = ({
  loading,
  isDecrement,
  percentage,
  showYoY = false,
}: TrendPillProps) => {
  const pillBg = loading
    ? "bg-frost-gray-200 animate-pulse"
    : isDecrement
    ? "bg-strawberry-100"
    : "bg-pear-100";

  const textColor = isDecrement ? "text-strawberry-700" : "text-pear-700";

  return (
    <div className="flex items-center gap-1 self-center min-h-[1.5rem]">
      <figure
        className={cn(
          "flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-full min-h-[1.5rem]",
          pillBg
        )}
        style={{ minHeight: "1.5rem" }}
      >
        {loading ? (
          <LoadingBlock
            size="custom"
            height="h-7"
            width="w-14"
            className="rounded-full"
          />
        ) : (
          <>
            <span
              className={cn("material-icons text-2xl select-none", textColor)}
              style={{
                width: 24,
                height: 24,
                display: "inline-block",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              {isDecrement ? "trending_down" : "trending_up"}
            </span>
            <figcaption
              className={cn(
                "trend-percentage text-xs font-medium mt-[1px] ml-1",
                textColor
              )}
              style={{
                display: "inline-block",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {`${Math.round(percentage)}%`}
            </figcaption>
            {showYoY && (
              <p
                className={cn("text-xs font-medium mt-[1px]", textColor)}
                style={{ width: 24, display: "inline-block" }}
              >
                YoY
              </p>
            )}
          </>
        )}
      </figure>
    </div>
  );
};

export default TrendPill;
