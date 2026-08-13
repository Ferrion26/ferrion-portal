// Einmaliges Einspielen echter Baseline-Daten aus Huaweis Versions-/
// Patch-Übersicht (Screenshot) und den bereitgestellten Release-Notes-
// Dokumenten (OceanStor V700R001C30, V700R001C20SPH106 Patch, FusionCompute
// 8.10.0). Idempotent: Policies werden per Name+Produkt gesucht statt blind
// neu angelegt, Versionen per upsert (policyId+versionNumber ist unique) —
// ein wiederholter Lauf erzeugt keine Duplikate und aktualisiert die Felder
// auf den hier hinterlegten Stand.
//
// Bewusst NICHT erfunden: für die 6 OceanStor-Versionen, zu denen keine
// Release Notes vorlagen, bleiben newFeatures/resolvedIssues leer — nur
// die aus dem Screenshot ablesbaren Kopfdaten (Status/Datum/Empfohlen)
// werden gesetzt.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

async function upsertPolicy(name: string, productSlug: string, description: string) {
  const existing = await prisma.baselinePolicy.findFirst({ where: { name, productSlug } });
  if (existing) return existing;
  return prisma.baselinePolicy.create({ data: { name, productSlug, description } });
}

async function upsertVersion(policyId: string, data: Parameters<typeof prisma.baselineSoftwareVersion.create>[0]["data"]) {
  const { versionNumber } = data;
  return prisma.baselineSoftwareVersion.upsert({
    where: { policyId_versionNumber: { policyId, versionNumber: versionNumber as string } },
    create: data,
    update: data,
  });
}

async function main() {
  // ─────────────────────────────── OceanStor ───────────────────────────────
  const oceanstor = await upsertPolicy(
    "OceanStor Firmware-Baseline",
    "oceanstor-hybrid-flash",
    "Empfohlene OceanStor-Firmware-Version laut Huawei-Support-Portal, inkl. Bugfixes/New Features aus den Release Notes."
  );

  await upsertVersion(oceanstor.id, {
    policyId: oceanstor.id,
    versionNumber: "OceanStor Series V700R001C10SPH128",
    status: "Valid",
    publicationDate: new Date("2026-07-28"),
    recommended: true,
    description: "Von Huawei aktuell als empfohlene Version markiert.",
  });
  await upsertVersion(oceanstor.id, {
    policyId: oceanstor.id,
    versionNumber: "OceanStor Series V700R001C10SPC100",
    status: "Valid",
    publicationDate: new Date("2025-09-29"),
    recommended: false,
    description: "Von Huawei ebenfalls als empfohlen markiert (Basis-Release der C10-Linie) — als Ziel für Vergleiche wird hier die neuere C10SPH128 verwendet.",
  });
  await upsertVersion(oceanstor.id, {
    policyId: oceanstor.id,
    versionNumber: "OceanStor Series V700R001C30",
    status: "Valid",
    publicationDate: new Date("2026-07-02"),
    recommended: false,
    sourceDocument: "OceanStor V700R001C30 Release Notes, Issue 01, 2026-06-30",
    newFeatures: [
      {
        title: "Enhanced FlashEver capability",
        description:
          "The new controller enclosure inherits the FlashEver capability of the existing controller enclosure. Supports capacity expansion of common SAS disk enclosures with smart SAS disk enclosure configuration and co-deployment of TLC and QLC in the same cluster (not in the same pool).",
      },
      { title: "Enhanced native object capability", description: "Supports native object versioning." },
      {
        title: "Enhanced NFS feature",
        description: "Supports NFSv3 mounts over UDP and enables NFS+ integration with GaussDB V6 to build an RAC solution.",
      },
      {
        title: "Enhanced SMB feature",
        description: "Supports Windows SMB 3.0 Multi-channel function, SMB watch tree capability, and SMB signature performance optimization.",
      },
      {
        title: "Enhanced NAS server-free migration",
        description: "Supports cross-protocol migration from Dell EMC Unity and Isilon storage systems to destination file systems using Native security style.",
      },
      {
        title: "Enhanced DR capability",
        description:
          "Supports tenant-level drills for NAS HyperMetro deployments, configuration synchronization across multiple data centers for NAS and object storage, and snapshot consistency groups for SAN DR Star.",
      },
    ],
  });
  await upsertVersion(oceanstor.id, {
    policyId: oceanstor.id,
    versionNumber: "OceanStor Series V700R001C20SPH106",
    status: "Valid",
    publicationDate: new Date("2026-06-07"),
    recommended: false,
    description: "Patch auf V700R001C20SPC100.",
    sourceDocument: "OceanStor V700R001C20SPH106 Patch Release Notes, Issue 01, 2026-06-05",
    resolvedIssues: [
      {
        ticketNumber: "DTS2026052007481",
        title: "The available space of a storage pool decreases.",
        description: "Temporary data generated during deduplication is not reclaimed in specific scenarios (device version V700R001C00 or later, deduplication supported).",
        severity: "Major",
        solution: "Optimize the logic for reclaiming space occupied by temporary data in this scenario.",
      },
      {
        ticketNumber: "DTS2026050922697",
        title: "Requests from multiple NAS hosts are not responded, and write I/Os are suspended.",
        description: "Occurs when two ports on a Hi1822V120 NIC are bonded for DTOE services and read services fully utilize the port bandwidth for over 5 minutes.",
        severity: "Major",
        solution: "Evenly distribute COS weights during ETS initialization.",
      },
      {
        ticketNumber: "DTS2026051120445",
        title: "The Hi1822V120 DTOE interface module resets.",
        description: "Occurs when protocol concurrency exceeds the upper limit or the chip is abnormal.",
        severity: "Info",
        solution: "Optimize the location capability and supplement driver/protocol interaction information in logs.",
      },
      {
        ticketNumber: "DTS2026031403838",
        title: "A connected smart disk enclosure is not displayed on DeviceManager, preventing service delivery.",
        description: "Occurs on a new 5901 extension board during cold startup when the power button is pressed more than 1 minute after the power cable is inserted.",
        severity: "Major",
        solution: "Obtain the extension board type after power-on and persist it.",
      },
    ],
  });
  await upsertVersion(oceanstor.id, {
    policyId: oceanstor.id,
    versionNumber: "OceanStor Series V700R001C10SPH118",
    status: "Valid",
    publicationDate: new Date("2026-06-02"),
    recommended: false,
  });
  await upsertVersion(oceanstor.id, {
    policyId: oceanstor.id,
    versionNumber: "OceanStor Series V700R001C10SPH116",
    status: "Valid",
    publicationDate: new Date("2026-05-07"),
    recommended: false,
  });
  await upsertVersion(oceanstor.id, {
    policyId: oceanstor.id,
    versionNumber: "OceanStor Series V700R001C20SPC100",
    status: "Valid",
    publicationDate: new Date("2026-03-31"),
    recommended: false,
  });
  await upsertVersion(oceanstor.id, {
    policyId: oceanstor.id,
    versionNumber: "OceanStor Series V700R001C00SPH221",
    status: "Valid",
    publicationDate: new Date("2025-10-13"),
    recommended: false,
  });

  // ─────────────────────────────── FusionCompute ───────────────────────────
  const fusioncompute = await upsertPolicy(
    "FusionCompute Firmware-Baseline",
    "huawei-dcs",
    "Empfohlene FusionCompute-Version, inkl. Bugfixes/New Features aus den Release Notes."
  );

  await upsertVersion(fusioncompute.id, {
    policyId: fusioncompute.id,
    versionNumber: "FusionCompute 8.10.0",
    status: "Valid",
    publicationDate: new Date("2026-06-30"),
    recommended: true,
    description: "FusionCompute 8.10.0 ist ein global eingeschränktes kommerzielles Release (\"globally restricted commercial version\").",
    sourceDocument: "FusionCompute 8.10.0 Release Notes, Issue 01, 2026-06-30",
    newFeatures: [
      { title: "Kunpeng hardware fault detection", description: "The combination of DCS and Kunpeng hardware improves hardware fault detection capabilities and reliability — detection of Kunpeng CPU core failures and memory UCE faults." },
      { title: "LAN-free backup for virtualized storage", description: "DCS supports LAN-free backup for virtualized storage." },
      { title: "One-click performance mode", description: "The one-click performance mode is supported for core transaction systems to meet performance requirements with one click." },
      { title: "Virtual shared disks for WSFC", description: "FusionCompute supports the creation of virtual shared disks for setting up WSFC clusters." },
      { title: "Automatic migration/HA based on memory CE storm monitoring", description: "Out-of-band monitoring of memory CE storms can report an alarm, enter maintenance mode, and start/migrate VMs via HA based on custom policies." },
      { title: "Pending cost management for tasks", description: "Pending cost adjustment, concurrency restriction, and resource reservation for tasks are added." },
      { title: "Multi host-group / VM-group membership", description: "A host can belong to multiple host groups and a VM to multiple VM groups; these groups can be used to configure rule groups (multiple VM-group-to-host-group rules per VM)." },
      { title: "NUMA affinity", description: "VM CPUs can be preferentially affined to the same NUMA node during startup/migration/HA and during VRM installation; CPU usage across NUMA nodes can be balanced while VMs run." },
      { title: "Live migration and HA with core binding (GaussDB)", description: "Live migration and HA are supported for VMs with core binding in GaussDB scenarios." },
    ],
    modifiedFeatures: [
      { title: "DCS restoration bandwidth (LAN-based)", description: "Should reach 200 MB/s/disk/VM without restrictions on the numbers of VMs and disks." },
      { title: "Online capacity expansion for RDM disks", description: "Online capacity expansion is now supported for RDM disks." },
      { title: "Automatic SDN reconnection after DR switchover", description: "In the DCS private cloud CSHA DR scenario, eDME can automatically connect to an SDN controller after a DR switchover, eliminating manual configuration." },
      { title: "IPv6 in non-SDN multi-tenant DCS scenario", description: "IPv6 is now supported in the non-SDN multi-tenant scenario of DCS." },
      { title: "Foreground open-source framework switch", description: "The foreground can switch to an open-source framework (trusted open source)." },
      { title: "Graylog server connectivity", description: "FusionCompute can connect to a Graylog server." },
      { title: "Underlying VM performance monitoring data", description: "More underlying performance data is added to FusionCompute to effectively monitor VMs." },
      { title: "SSD cache disks", description: "FusionCompute supports SSDs as cache disks to accelerate read performance." },
      { title: "Multi-tenant CloudSOP switchover adaptation", description: "The multi-tenant service adapts to the routine platform version switchover of CloudSOP (trusted open source)." },
      { title: "IP/port access control for CNA and VRM nodes", description: "FusionCompute supports access control for CNA and VRM nodes by IP address and port." },
      { title: "Platform inspection and pre-upgrade check", description: "FusionCompute supports platform inspection and pre-upgrade check on the management WebUI." },
      { title: "Cross-site batch VM migration", description: "The VRM management capability of the FusionCompute platform supports cross-site batch VM migration." },
      { title: "VIMS metadata fault rectification tool set", description: "A tool set is provided for improving the efficiency of rectifying VIMS metadata faults on the live network." },
    ],
    resolvedIssues: [
      {
        title: "Failed to Add a Multi-NIC VM Running Windows Server 2022 Chinese Edition Deployed from a Template to a Customized Domain",
        description: "Failed to add a multi-NIC VM running Windows Server 2022 Chinese Edition deployed from a template to a customized domain.",
        severity: "Minor",
        solution: "Fixed in the software.",
      },
      {
        title: "Storage Device Scan Times Out When There Are a Large Number of LUNs After an Audit Rule Is Configured",
        description: "Storage device scan times out when there are a large number of LUNs after an audit rule is configured.",
        severity: "Minor",
        solution: "Fixed in the software.",
      },
      {
        title: "Migration Rate of a Cross-Site Migration Task Is Incorrectly Displayed",
        description: "Migration rate of a cross-site migration task is incorrectly displayed.",
        severity: "Info",
        solution: "Fixed in the software.",
      },
    ],
  });

  console.log("Baseline-Daten eingespielt: OceanStor (8 Versionen), FusionCompute (1 Version).");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
