"use client";

import { useTransition } from "react";

interface Props {
  action: (formData: FormData) => Promise<void>;
  id: string;
  filePath: string;
  coverImagePath: string;
}

export default function DeleteDocumentButton({ action, id, filePath, coverImagePath }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    const fd = new FormData();
    fd.append("id", id);
    fd.append("file_path", filePath);
    fd.append("cover_image_path", coverImagePath);
    startTransition(() => action(fd));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-heading font-semibold px-3 py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
