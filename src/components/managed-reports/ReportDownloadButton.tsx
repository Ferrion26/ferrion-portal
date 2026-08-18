"use client";

export default function ReportDownloadButton({
  documentId,
  label = "PDF öffnen →",
}: {
  documentId: string;
  fileName?: string;
  label?: string;
}) {
  async function handleOpen() {
    // Tab muss synchron im Click-Handler geöffnet werden, sonst blockieren
    // Popup-Blocker den erst nach dem await zurückkommenden Aufruf.
    const tab = window.open("", "_blank");
    const res = await fetch(`/api/documents/${documentId}/download`);
    if (!res.ok) {
      tab?.close();
      alert("Öffnen fehlgeschlagen.");
      return;
    }
    const { url } = await res.json();
    if (tab) tab.location.href = url;
    else window.open(url, "_blank");
  }

  return (
    <button onClick={handleOpen} className="text-sm text-[#c9a84c] hover:text-[#e0bc5a] font-medium">
      {label}
    </button>
  );
}
