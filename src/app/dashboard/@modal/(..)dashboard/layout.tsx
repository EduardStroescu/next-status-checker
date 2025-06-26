import MaximizeModal from "@/components/MaximizeModal";
import { Modal } from "@/components/Modal";

export default function ModalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Modal className="animate-in ease-in fade-in-0 zoom-in-95 slide-in-from-bottom-2">
      <MaximizeModal />
      {children}
    </Modal>
  );
}
