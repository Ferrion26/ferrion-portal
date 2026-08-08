"use client";

export default function ReportDownloadButton({ documentId, fileName }: { documentId: string; fileName: string }) {
  async function handleDownload() {
    const res = await fetch(`/api/documents/${documentId}/download`);
    if (!res.ok) {
      alert("Download fehlgeschlagen.");
      return;
    }
    const { url } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  }

  return (
    <button onClick={handleDownload} className="text-sm text-[#c9a84c] hover:text-[#e0bc5a] font-medium">
      Download →
    </button>
  );
}
