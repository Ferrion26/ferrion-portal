"use client";

export default function DownloadButton({
  documentId,
  fileName,
}: {
  documentId: string;
  fileName: string;
}) {
  async function handleDownload() {
    const res = await fetch(`/api/documents/${documentId}/download`);
    if (!res.ok) {
      alert("Download failed.");
      return;
    }
    const { url } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  }

  return (
    <button
      onClick={handleDownload}
      className="text-sm text-brand-600 hover:text-brand-800 font-medium"
    >
      Download
    </button>
  );
}
