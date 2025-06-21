import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <Spinner fontSize={2}>{`Loading • Loading • Loading • `}</Spinner>
    </div>
  );
}
