"use client";

import { useState, useTransition } from "react";

interface Props {
  action: (formData: FormData) => Promise<void>;
  id: string;
  filePath: string;
  coverImagePath: string;
}

export default function DeleteDocumentButton({ action, id, filePath, coverImagePath }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("file_path", filePath);
    fd.append("cover_image_path", coverImagePath);
    startTransition(async () => {
      await action(fd);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-heading font-semibold px-3 py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
      >
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
            {/* Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-heading font-semibold text-navy">Delete document?</h2>
              <p className="text-sm text-slate/70 leading-relaxed">
                This will permanently remove the document and its files from storage. This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="text-sm font-heading font-semibold px-4 py-2 rounded border border-border text-slate hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                className="text-sm font-heading font-semibold px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {pending ? "Deleting…" : "Delete document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
