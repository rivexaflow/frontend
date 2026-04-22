import { LoadingState } from "@/components/shared/loading-state/loading-state";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#f7f9ff] p-8">
      <LoadingState label="Preparing your workspace" />
    </div>
  );
}
