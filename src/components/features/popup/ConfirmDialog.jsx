// src/components/features/popup/ConfirmDialog.jsx

"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete data from our servers.",
  confirmText = "Yes, delete",
  cancelText = "Cancel",
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <XCircle className="text-red-500 w-6 h-6" />
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="text-sm text-gray-600 mt-2">{description}</div>

        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
