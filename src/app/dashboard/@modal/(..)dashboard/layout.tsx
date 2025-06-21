import MaximizeModal from "@/components/MaximizeModal";
import { Modal } from "@/components/Modal";
import { Suspense } from "react";

export default function ModalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Modal>
      <Suspense fallback={null}>
        <MaximizeModal />
      </Suspense>
      {children}
    </Modal>
  );
}
