import { formatValue } from "../../utils/utils";
import LoadingBlock from "./LoadingBlock";

interface TotalValueProps {
  loading: boolean;
  total?: number | null;
}

const TotalValue = ({ loading, total }: TotalValueProps) => (
  <div className="text-3xl font-bold text-oxford-blue-900 mr-2 min-h-[2.25rem]">
    {loading ? (
      <LoadingBlock size="custom" height="h-9" width="w-20" />
    ) : total !== null ? (
      formatValue(total ?? 0)
    ) : (
      "—"
    )}
  </div>
);

export default TotalValue;
