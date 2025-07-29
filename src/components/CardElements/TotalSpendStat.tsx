import { formatValue } from "../../utils/utils";

interface TotalValueProps {
  loading: boolean;
  total?: number | null;
}

const TotalValue = ({ loading, total }: TotalValueProps) => (
  <div className="text-3xl font-bold text-oxford-blue-900 mr-2 min-h-[2.25rem]">
    {loading ? (
      <span className="inline-block h-9 w-20 bg-frost-gray-200 rounded animate-pulse" />
    ) : total !== null ? (
      formatValue(total ?? 0)
    ) : (
      "—"
    )}
  </div>
);

export default TotalValue;
