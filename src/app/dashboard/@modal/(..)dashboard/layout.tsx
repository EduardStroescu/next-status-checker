import MaximizeModal from "@/components/MaximizeModal";
import { Modal } from "@/components/Modal";

export default function ModalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Modal>
      <MaximizeModal />
      {children}
    </Modal>
  );
}
