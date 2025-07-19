import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tribe-nest/frontend-shared";
import { Button } from "@tribe-nest/frontend-shared";

interface ConfirmationModalProps {
  text?: string;
  onConfirm: () => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  text = "Are you sure you want continue?",
  onConfirm,
  trigger,
  isOpen,
  setIsOpen,
  title = "Confirmation",
  confirmText = "Yes",
  cancelText = "No",
}) => {
  const handleConfirm = () => {
    onConfirm();
    setIsOpen?.(false);
  };

  const handleCancel = () => {
    setIsOpen?.(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p>{text}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
