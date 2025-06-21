import { Modal } from "@/components/Modal";
import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <Modal>
      <div className="flex flex-col min-h-[30dvh] min-w-xl items-center justify-center">
        <Spinner fontSize={2}>{`Loading • Loading • Loading • `}</Spinner>
      </div>
    </Modal>
  );
}
