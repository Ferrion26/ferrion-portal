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

  // ─────────────────────────────── NetApp ONTAP ────────────────────────────
  // Quelle: docs.netapp.com/us-en/ontap/release-notes/ ("ONTAP 9 release
  // highlights") und die von dort verlinkten "What's new in ONTAP X.Y.Z"-
  // Einzelseiten. Die Seite selbst markiert KEINE Version als "empfohlen"
  // (anders als Huaweis Versionsliste) und die eigentlichen Release Notes
  // mit Bugfixes/known issues liegen hinter einem NetApp-Account-Login —
  // daher bleiben resolvedIssues hier bei ALLEN Versionen leer, nicht nur
  // bei einzelnen (transparent im Policy-Beschreibungstext vermerkt).
  //
  // Datierung: docs.netapp.com zeigt pro Seite nur ein "zuletzt bearbeitet"-
  // Datum (alle nah beieinander, Mitte 2026), keine echten Versions-
  // Erscheinungsdaten. Für 9.9.1–9.16.1 werden die tatsächlichen, öffentlich
  // bekannten ONTAP-Erscheinungsdaten verwendet; für 9.17.1–9.19.1 (jenseits
  // des Wissensstands) wird die reale ~6-Monats-Kadenz fortgeschrieben und
  // im description-Feld ausdrücklich als geschätzt gekennzeichnet — nötig,
  // damit die Versionsreihenfolge (und damit "was liegt zwischen X und Y")
  // überhaupt auswertbar ist, aber bewusst nicht als verifiziertes Datum
  // ausgegeben.
  const netapp = await upsertPolicy(
    "ONTAP Firmware-Baseline",
    "netapp-aff",
    "Empfohlene ONTAP-Version, inkl. New Features aus docs.netapp.com. Resolved Issues liegen für alle Versionen NICHT vor — die NetApp-Release-Notes mit Bugfixes/known issues erfordern ein NetApp-Support-Konto. Versions-Erscheinungsdaten vor 9.17.1 sind real, ab 9.17.1 geschätzt (siehe jeweilige Versionsbeschreibung)."
  );

  const NETAPP_SOURCE = (v: string) => `docs.netapp.com/us-en/ontap/release-notes/whats-new-${v.replace(/\./g, "")}.html`;

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.9.1",
    status: "Valid",
    publicationDate: new Date("2021-09-01"),
    recommended: false,
    sourceDocument: NETAPP_SOURCE("9.9.1"),
    newFeatures: [
      { title: "Enhanced security for CLI remote access management", description: "Support for SHA512 and SSH A512 password hashing protects administrator account credentials from malicious actors trying to gain system access." },
      { title: "MetroCluster IP enhancements: support for 8-node clusters", description: "The new limit is twice as large as the previous one, providing support for larger MetroCluster configurations and enabling continuous data availability." },
      { title: "SnapMirror active sync", description: "Offers more replication options for backup and disaster recovery for large data containers for NAS workloads." },
      { title: "Increased SAN performance", description: "Delivers up to four-times higher SAN performance for single LUN applications such as VMware datastores." },
      { title: "New object storage option for hybrid cloud", description: "Enables use of StorageGRID as a destination for NetApp Cloud Backup Service to simplify and automate backup of on-premises ONTAP data." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.10.1",
    status: "Valid",
    publicationDate: new Date("2021-12-01"),
    recommended: false,
    sourceDocument: NETAPP_SOURCE("9.10.1"),
    newFeatures: [
      { title: "Autonomous Ransomware Protection", description: "Automatically creates a snapshot of your volume and alerts administrators when abnormal activity is detected, enabling faster detection and recovery from ransomware attacks." },
      { title: "System Manager enhancements", description: "Automatic download of firmware updates for disks, shelves, and service processors, plus new integrations with Active IQ Digital Advisor, NetApp Console, and certificate management." },
      { title: "File System Analytics enhancements", description: "Additional telemetry to identify top files, directories, and users in your file share, improving resource planning and QoS implementation." },
      { title: "NVMe over TCP (NVMe/TCP) support for AFF systems", description: "Achieve high performance and reduce TCO for enterprise SAN and modern workloads on AFF systems using NVMe/TCP on the existing Ethernet network." },
      { title: "NVMe over Fibre Channel (NVMe/FC) support for NetApp FAS systems", description: "Use the NVMe/FC protocol on hybrid arrays to enable uniform migration to NVMe." },
      { title: "Native hybrid cloud backup for object storage", description: "Protect ONTAP S3 data with SnapMirror replication to on-premises StorageGRID, Amazon S3, or another ONTAP S3 bucket." },
      { title: "Global file-locking with FlexCache", description: "Ensures file consistency at cache locations during source-file updates via exclusive file-read locks in an origin-to-cache relationship." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.11.1",
    status: "Valid",
    publicationDate: new Date("2022-05-01"),
    recommended: false,
    sourceDocument: NETAPP_SOURCE("9.11.1"),
    newFeatures: [
      { title: "Multi-admin verification", description: "Industry-first native approach requiring multiple approvals for sensitive administrative tasks such as deleting a snapshot or volume." },
      { title: "Enhancements to Autonomous Ransomware Protection", description: "Uses machine learning to detect ransomware threats with increased granularity, accelerating identification and recovery." },
      { title: "SnapLock Compliance for FlexGroup volumes", description: "Secures multi-petabyte datasets (e.g. EDA, media & entertainment) with WORM file locking so data cannot be changed or deleted." },
      { title: "Asynchronous directory delete", description: "File deletion occurs in the background, allowing large directories to be deleted without performance/latency impact on host I/O." },
      { title: "S3 enhancements", description: "Additional API endpoints and object versioning at the bucket level, enabling multiple versions of an object in the same bucket." },
      { title: "System Manager enhancements", description: "Enhanced management/configuration of storage aggregates, improved system analytics visibility, and hardware visualization for FAS systems." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.12.1",
    status: "Valid",
    publicationDate: new Date("2022-10-01"),
    recommended: false,
    sourceDocument: NETAPP_SOURCE("9.12.1"),
    newFeatures: [
      { title: "Tamper-proof Snapshots", description: "With SnapLock technology, snapshots can be protected from deletion on source or destination, retaining recovery points against ransomware or rogue admins." },
      { title: "Autonomous Ransomware Protection (ARP) enhancements", description: "Immediately enable ARP on secondary storage based on the primary's screening model; instantly identify attacks on secondary storage after a failover." },
      { title: "FPolicy", description: "One-click activation to automatically block known malicious files, protecting against typical ransomware attacks using common file extensions." },
      { title: "Security hardening: Tamper-proof retention logging", description: "Ensures compromised administrator accounts cannot hide malicious actions; admin/user history cannot be altered or deleted undetected." },
      { title: "Security hardening: Expanded multifactor authentication", description: "MFA for CLI (SSH) supports Yubikey hardware tokens; Cisco DUO supported for MFA with System Manager." },
      { title: "File-object duality (multi-protocol access)", description: "Native S3 read/write access to the same data source that already has NAS access, eliminating duplicate copies of data." },
      { title: "FlexGroup rebalancing", description: "Nondisruptive rebalancing of unbalanced FlexGroup constituents from the ONTAP CLI, REST API, or System Manager." },
      { title: "Storage capacity enhancements", description: "WAFL space reservation significantly reduced, providing up to 40 TiB more usable capacity per aggregate." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.13.1",
    status: "Valid",
    publicationDate: new Date("2023-05-01"),
    recommended: false,
    sourceDocument: NETAPP_SOURCE("9.13.1"),
    newFeatures: [
      { title: "ARP enhancements: automatic enablement", description: "ARP automatically moves from training into production mode after sufficient learning data, no manual enablement needed after the 30-day period." },
      { title: "Multi-admin verification support for ARP", description: "ARP disable commands are protected by multi-admin verification, so no single administrator can expose data by disabling ARP." },
      { title: "FlexGroup support for ARP", description: "ARP can monitor and protect FlexGroup volumes spanning multiple volumes and nodes in the cluster." },
      { title: "Performance and capacity monitoring for consistency groups in System Manager", description: "Detailed monitoring per consistency group, identifying issues at the application level rather than only the data-object level." },
      { title: "Tenant capacity management", description: "Multi-tenant customers/service providers can set a capacity limit per SVM, enabling self-service provisioning without over-consumption risk." },
      { title: "Quality of Service ceilings and floors", description: "Group volumes, LUNs, or files and assign a QoS ceiling (max IOPs) or floor (min IOPs)." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.14.1",
    status: "Valid",
    publicationDate: new Date("2023-11-01"),
    recommended: false,
    sourceDocument: NETAPP_SOURCE("9.14.1"),
    newFeatures: [
      { title: "WAFL reservation reduction", description: "Immediate 5% increase in usable space on FAS and Cloud Volumes ONTAP systems by reducing the WAFL reserve on aggregates ≥30 TB." },
      { title: "FabricPool enhancements", description: "Increased read performance and direct writing to the cloud, lowering the risk of running out of space and reducing storage costs." },
      { title: "Support for OAuth 2.0", description: "Secure access to ONTAP for automation frameworks without exposing user IDs/passwords in plain text scripts or runbooks." },
      { title: "ARP enhancements", description: "More control over event security, adjusting alert conditions and reducing false positives." },
      { title: "SnapMirror disaster recovery rehearsal in System Manager", description: "Simple workflow to test DR at a remote location and clean up afterward, enabling more frequent testing." },
      { title: "S3 object lock support", description: "The object-lock API command protects data written via S3 from deletion for the appropriate retention period." },
      { title: "Cluster and volume tagging", description: "Add metadata tags to volumes/clusters that follow the data as it moves between on-premises and the cloud." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.15.1",
    status: "Valid",
    publicationDate: new Date("2024-05-01"),
    recommended: false,
    sourceDocument: NETAPP_SOURCE("9.15.1"),
    newFeatures: [
      { title: "[Data protection] Windows backup applications and Unix-style symlinks on servers", description: "You can back up the symlink itself instead of the data it points to, improving backup application performance." },
      { title: "[Data protection] SnapMirror active sync supports symmetric active/active deployments", description: "Enables read and write I/O from both copies of a protected LUN with bidirectional synchronous replication." },
      { title: "[Data protection] Increased limit for volumes in a consistency group using SnapMirror asynchronous", description: "Consistency groups now support up to 80 volumes." },
      { title: "[Data protection] Admin privilege level for consistency group REST API/CLI operations", description: "ONTAP CLI and REST API operations for consistency groups are now supported at the administrative privilege level." },
      { title: "[Data protection] Persistent reservations for VMware vVols with WSFC", description: "You can create a persistent reservation with a vVol, supported in a Windows Server Failover Cluster." },
      { title: "[Security] Simplified FPolicy persistent store creation and configuration", description: "Create the FPolicy persistent store and automate volume creation/configuration at the same time." },
      { title: "[Security] Support for NFSv3 with RDMA", description: "NFS over RDMA configurations now support NFSv3." },
      { title: "[Security] FPolicy supports the NFS 4.1 protocol", description: "FPolicy now supports NFS 4.1." },
      { title: "[Security] Protobuf engine format support for FPolicy", description: "Notification messages can be encoded in binary form using Google Protobuf instead of XML, improving FPolicy performance." },
      { title: "[Security] Dynamic Authorization for SSH connections", description: "Initial framework assigning a security trust score to admin users, challenging suspicious activity with additional authorization checks (Zero Trust)." },
      { title: "[Security] TLS 1.3 for S3 storage, FlexCache, and Cluster Peering encryption", description: "TLS 1.3 (previously management-access only since 9.11.1) now covers S3 storage, FlexCache, and Cluster Peering." },
      { title: "[Security] Multi-admin verification rule set extended", description: "Rules can protect cluster configuration, LUN deletion, IPsec/SAML security config, volume snapshot operations, vServer configuration, and more." },
      { title: "[Security] AutoSupport messages via SMTP with TLS", description: "SMTPS establishes a secure transport channel, encrypting email traffic and optional email server credentials." },
      { title: "[Storage efficiency] Changes to reporting of volume space metrics", description: "New counters separate metadata usage from user data for more accurate chargeback models." },
      { title: "[Storage efficiency] CPU or dedicated offload processor", description: "Storage efficiency/data compaction on AFF A70/A90/A1K, using main CPU or a dedicated offload processor automatically, no configuration required." },
      { title: "[Storage resource management] FlexCache write-back support", description: "Write requests go to the local cache rather than the origin volume, improving performance for edge/write-heavy workloads." },
      { title: "[Storage resource management] Performance enhancement for File System Analytics", description: "Enforces 5-8% free volume capacity when enabling FSA, mitigating potential performance issues." },
      { title: "[Storage resource management] FlexClone volume encryption keys", description: "A FlexClone volume is assigned a dedicated encryption key independent of the FlexVol host volume's key." },
      { title: "[System Manager] SnapLock vault relationships configuration", description: "SnapLock vault relationships can be configured in System Manager when source and destination both run 9.15.1+." },
      { title: "[System Manager] Dashboard performance enhancements", description: "More complete descriptions and enhanced performance metrics for Health, Capacity, Network, and Performance views." },
      { title: "[Upgrade] LIF migration to HA partner node during automated nondisruptive upgrade", description: "If LIF migration to the other batch group fails during an automated upgrade, LIFs migrate to the HA partner node in the same batch group." },
    ],
  });

  // Vom Kunden (Uni Salzburg) tatsächlich gemeldete, installierte Version —
  // ein Patch von 9.15.1, kein eigener Feature-Release. Kein eigenes
  // Release-Notes-Dokument für diesen konkreten Patch-Level vorhanden,
  // daher keine Feature-/Fix-Liste — dient nur dazu, dass die installierte
  // Version in der Baseline-Historie erkannt wird (sonst "unknown" statt
  // "outdated" im Bericht). Datum geschätzt zwischen 9.15.1 und 9.16.1.
  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.15.1P13",
    status: "Valid",
    publicationDate: new Date("2024-09-01"),
    recommended: false,
    description: "Tatsächlich installierte Version bei Paris Lodron Universität Salzburg (Patch 13 von 9.15.1). Kein separates Release-Notes-Dokument für diesen Patch-Level verfügbar, Datum geschätzt.",
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.16.1",
    status: "Valid",
    publicationDate: new Date("2024-11-01"),
    recommended: false,
    sourceDocument: NETAPP_SOURCE("9.16.1"),
    newFeatures: [
      { title: "[Data protection] Multinode support for SnapMirror active sync", description: "Expands from the previous two-node limit to four-node clusters, enabling replication for larger workloads." },
      { title: "[Data protection] SnapMirror cloud fan-out relationships", description: "Fan out from the same source volume/FlexGroup to two different object stores (two stores, or one/two buckets each)." },
      { title: "[Data protection] SnapMirror cloud backups from a migrated volume", description: "Back up a volume already migrated to the cloud to the same destination object store without a re-baseline operation." },
      { title: "[Networking] MD5 authentication for BGP peer groups", description: "Protects BGP sessions so they can only be established among authorized peers, preventing route-hijacking attacks." },
      { title: "[Networking] IPsec hardware offload support", description: "Offload computationally intensive IPsec operations (encryption, integrity checks) to a supported NIC card, improving performance." },
      { title: "[S3 object storage] Multiprotocol S3 bucket support for object metadata and tagging", description: "S3 object tagging extended from non-multiprotocol buckets to NAS and S3 multiprotocol buckets." },
      { title: "[S3 object storage] Multiprotocol S3 bucket supports multipart upload", description: "Multipart uploads, previously non-multiprotocol only, extended to NAS and S3 multiprotocol buckets." },
      { title: "[S3 object storage] CORS support for ONTAP S3 buckets", description: "Cross-Origin Resource Sharing enables selective cross-origin access for web applications using ONTAP S3." },
      { title: "[S3 object storage] Snapshots of ONTAP S3 buckets", description: "Generate read-only, point-in-time snapshots of S3 buckets manually or via snapshot policies; browse/restore via S3 clients." },
      { title: "[SAN] NVMe space deallocation enabled by default", description: "Space deallocation ('hole punching'/'unmap') is on by default for NVMe namespaces, improving storage efficiency." },
      { title: "[Security] Multi-admin verification rule set extended to consistency groups", description: "Rules can protect consistency group create/delete/modify and snapshot operations." },
      { title: "[Security] Autonomous Ransomware Protection with AI enhancements (ARP/AI)", description: "99% precision/recall, no learning period on FlexVol volumes, automatic security-file updates independent of ONTAP upgrades (NAS only)." },
      { title: "[Security] NVMe/TCP over TLS 1.3", description: "Protects NVMe/TCP at the protocol layer with simplified configuration and improved performance vs. IPsec." },
      { title: "[Security] TLS 1.3 for FabricPool object store communication", description: "FabricPool communication with the object store now supports TLS 1.3." },
      { title: "[Security] OAuth 2.0 for Microsoft Entra ID", description: "OAuth 2.0 (since 9.14.1) now supports Entra ID (formerly Azure AD) claims, group/role mapping, and a new external role-mapping feature." },
      { title: "[Storage efficiency] Extended qtree performance monitoring", description: "Real-time latency statistics and archived historical data for qtree usage, enabling longer-term trend analysis." },
      { title: "[Storage resource management] Data protection volumes in SVMs with storage limit enabled", description: "SVMs with storage limits can now contain data-protection volumes in async DR, sync DR, or restore relationships." },
      { title: "[Storage resource management] FlexGroup advanced capacity distribution", description: "Distributes data within a single large, growing file across multiple FlexGroup member volumes, reducing bottlenecks." },
      { title: "[Storage resource management] SVM data mobility for migrating MetroCluster configurations", description: "Supports SVM migration between non-MetroCluster and MetroCluster IP, between two MetroCluster IP configs, and MetroCluster FC to IP." },
      { title: "[System Manager] WebAuthn multifactor authentication", description: "Supports WebAuthn MFA logins, enabling hardware security keys as a second authentication factor in System Manager." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.17.1",
    status: "Valid",
    publicationDate: new Date("2025-05-01"),
    recommended: false,
    description: "Erscheinungsdatum geschätzt (reale ~6-Monats-Kadenz ab 9.16.1 fortgeschrieben) — docs.netapp.com nennt kein Versions-Erscheinungsdatum.",
    sourceDocument: NETAPP_SOURCE("9.17.1"),
    newFeatures: [
      { title: "[Data protection] SnapMirror active sync support for host access over NVMe", description: "NVMe access for VMware workloads via NVMe/TCP and NVMe/FC host access on two-node ONTAP clusters." },
      { title: "[Data protection] ONTAP Cloud Mediator support with SnapMirror active sync", description: "Cloud-based mediator acts as quorum witness for active sync relationships, reducing operational complexity vs. a third site." },
      { title: "[S3 object storage] CopyObject action support in ONTAP S3 NAS buckets", description: "The CopyObject action is now supported within ONTAP S3 NAS buckets." },
      { title: "[S3 object storage] Linking an S3 NAS bucket to a junction path", description: "You can link a bucket to the volume instead of the junction path; the path auto-updates if it changes." },
      { title: "[S3 object storage] Multiprotocol support for tagging and metadata in multipart upload", description: "Tagging and user metadata key/value pairs supported by CreateMultipartUpload in multiprotocol (S3+NAS) environments." },
      { title: "[Security] Additional hypervisor support for ARP (from 9.17.1P5)", description: "Autonomous Ransomware Protection supports Hyper-V, KVM, and OpenStack hypervisors." },
      { title: "[Security] HTTP Strict Transport Security (HSTS) support", description: "Enforces secure HTTPS communication between a user's browser and ONTAP web services." },
      { title: "[Security] IPsec hardware offload with link aggregation groups", description: "Extends the hardware-offload support introduced in 9.16.1 to link aggregation groups." },
      { title: "[Security] IPsec postquantum pre-shared key support", description: "Protects IPsec against potential future quantum computer attacks." },
      { title: "[Security] OpenStack Barbican key manager support", description: "Supports OpenStack's Barbican key manager for NetApp Volume Encryption (NVE) keys." },
      { title: "[Security] Just in time (JIT) privilege elevation", description: "Users can request temporary role elevation for on-demand access to privileged RBAC commands, with configurable scope/duration." },
      { title: "[Security] Entra IdP and IdP group support for SAML authentication", description: "Supports Microsoft Entra as a SAML identity provider, with IdP group mapping to ONTAP roles." },
      { title: "[Security] Auditing of cross-cluster requests", description: "Both initiating and destination clusters now log activity for cross-cluster requests, not only the receiving cluster." },
      { title: "[Security] Support for SAN with Autonomous Ransomware Protection", description: "ARP/AI supports SAN volumes with encryption-based anomaly detection, entropy statistics, and configurable detection thresholds." },
      { title: "[Storage resource management] FSA enabled by default for new volumes", description: "File System Analytics is automatically active on new volumes on newly created NAS-allocated SVMs." },
      { title: "[Storage resource management] Direct delete progress on FlexGroup volumes", description: "volume file async-delete show now includes asynchronous delete jobs issued from clients." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.18.1",
    status: "Valid",
    publicationDate: new Date("2025-11-01"),
    recommended: false,
    description: "Erscheinungsdatum geschätzt (reale ~6-Monats-Kadenz ab 9.16.1 fortgeschrieben) — docs.netapp.com nennt kein Versions-Erscheinungsdatum.",
    sourceDocument: NETAPP_SOURCE("9.18.1"),
    newFeatures: [
      { title: "[Data protection] SnapMirror cloud for MetroCluster FlexGroup volumes", description: "SnapMirror cloud supports backup/restore of FlexGroup volumes in MetroCluster configurations." },
      { title: "[Networking] IPsec hardware offload IPv6 support", description: "IPsec hardware offload is extended to IPv6." },
      { title: "[Networking] OpenSSL PQC algorithms", description: "Postquantum cryptographic algorithms for SSL, available when SSL FIPS mode is disabled." },
      { title: "[Networking] ONTAP backend cluster network encryption", description: "TLS encryption can be enabled for data-in-flight on the ONTAP backend cluster network." },
      { title: "[Networking] ONTAP HA traffic network encryption", description: "Encryption can be enabled for traffic between nodes in HA pairs." },
      { title: "[SAN] NVMe copy offload", description: "An NVMe host can offload copy operations from its CPU to the ONTAP storage controller's CPU, freeing host CPU for applications." },
      { title: "[S3 object storage] Point-in-time S3 snapshot restore", description: "S3 snapshot buckets are natively accessible via the CLI; restore a single object, a set of objects, or a whole bucket." },
      { title: "[S3 object storage] NAS buckets on FlexCache volumes", description: "Applications can access data on FlexCache volumes via the S3 protocol once all cluster nodes run 9.18.1+." },
      { title: "[Security] FlexGroup volume support for ARP/AI at parity with FlexVol", description: "FlexGroup volumes gain parity with FlexVol for ARP/AI on-prem (AFF/FAS) and virtual ONTAP; ARP/AI becomes the default." },
      { title: "[Security] ARP/AI enabled by default for new volumes", description: "On AFF A/C series, ASA, and ASA r2 systems, ARP/AI auto-enables on new volumes after a 12-hour opt-out grace period." },
      { title: "[Storage resource management] Two-level nested QoS policy groups", description: "Assign a QoS policy to an SVM and to volumes under that SVM at the same time." },
      { title: "[Storage resource management] SVM FlexCache volumes of origin volumes in SVM-DR", description: "Create SVM FlexCache volumes of origin volumes that are part of an SVM-DR relationship." },
      { title: "[Storage resource management] Space usage reporting changes", description: "storage aggregate show-space changes how Logical Referenced/Unreferenced Capacity is reported, more precisely reflecting fragmented objects." },
    ],
  });

  await upsertVersion(netapp.id, {
    policyId: netapp.id,
    versionNumber: "ONTAP 9.19.1",
    status: "Valid",
    publicationDate: new Date("2026-05-01"),
    recommended: true,
    description: "Aktuell empfohlene Baseline-Version (neueste verfügbare ONTAP-9-Version laut docs.netapp.com). Erscheinungsdatum geschätzt (reale ~6-Monats-Kadenz ab 9.16.1 fortgeschrieben) — docs.netapp.com nennt kein Versions-Erscheinungsdatum.",
    sourceDocument: NETAPP_SOURCE("9.19.1"),
    newFeatures: [
      { title: "[Data protection] SnapMirror active sync transparent application failover for AIX", description: "Symmetric active/active SnapMirror active sync supports transparent, zero-RPO failover for AIX on 2-node clusters." },
      { title: "[Data protection] SnapMirror cloud limit increased to 100 S3 buckets", description: "SnapMirror cloud now supports up to 100 S3 buckets." },
      { title: "[Data protection] SnapMirror synchronous tamperproof snapshot locking", description: "Tamperproof snapshot locking can now be used with SnapMirror synchronous." },
      { title: "[Data protection] SnapMirror synchronous replicates scheduled snapshots", description: "Scheduled snapshots can be replicated to the destination volume with SnapMirror synchronous." },
      { title: "[Data protection] SnapMirror active sync support for NAS", description: "Supports NAS workloads at the SVM level via NFS/SMB on AFF (2-node) or AFX (4-node) clusters, read-write on the primary only." },
      { title: "[NAS] NAS performance enhancement for small-directory listings", description: "More CPU resources for listing small NAS directories (≤2 MB, ~25,000 files) under high concurrent client counts, automatic." },
      { title: "[Networking] Independent NFSv4.2 management per SVM", description: "NFSv4.2 support is managed independently of NFSv4.1; enabled by default unless explicitly disabled." },
      { title: "[Networking] LIF failover enhancement", description: "System-defined failover group policy dynamically expands failover targets to any available port/node in the broadcast domain, not just one other node." },
      { title: "[Networking] TCP performance improvements (PRR/RACK)", description: "Improves TCP transfer performance over lossy, high-latency WAN links; PRR enabled by default, RACK for congested ~25 Gbit/s+ links." },
      { title: "[SAN] Direct-attachment FC configurations", description: "FC and FC-NVMe hosts can connect directly to FC adapter ports on AFF/ASA/FAS without FC switches." },
      { title: "[SAN] Active-active multipathing on AFF systems", description: "All paths within the owning HA pair stay active-optimized, reducing failover time (previously ASA-only)." },
      { title: "[SAN] Automatic SAN LIF failover extended", description: "Automatic LIF failover for iSCSI (active-active / active-active-scsi-only) and NVMe/TCP (active-active) protocol LIFs on AFF/ASA." },
      { title: "[SAN] Foreign LUN Import (FLI) supports iSCSI", description: "FLI supports the iSCSI protocol for backend connectivity when migrating block data from third-party storage." },
      { title: "[S3 object storage] Conditional writes and deletes with enforcement", description: "Enforce conditions for object uploads/deletes, preventing overwrites or unintended deletes." },
      { title: "[S3 object storage] Second S3 access key per user", description: "Cluster admins can generate a second access key per S3 user to maintain access during key rotation." },
      { title: "[Security] TLS offload configuration", description: "Offload TLS encryption/decryption to supported Ethernet cards, reducing CPU overhead and improving performance." },
      { title: "[Security] NFS over TLS", description: "Encrypt NFS traffic in transit with TLS 1.3, including optional per-LIF mutual TLS and export-policy controls." },
      { title: "[Security] ARP/AI support for SnapMirror synchronous and active sync", description: "Protects primary volumes in SnapMirror synchronous (NAS/SAN) and active sync SAN relationships on FAS/AFF/AFX/ASA r2." },
      { title: "[Security] WebAuthn Relying Party domain restriction", description: "New -rp-domains parameter restricts permitted RP domains accepted during WebAuthn (FIDO2) MFA." },
      { title: "[Storage resource management] Enhanced volume space reporting", description: "volume show-space now includes the directory used for the space reporting in its output." },
      { title: "[Storage resource management] Configurable automatic QoS throughput ceiling increases", description: "Default settings controlling automatic QoS ceiling increases for short-term performance needs can now be modified." },
      { title: "[System Manager] New SVM dashboard", description: "Dedicated dashboard for SVM administrators to monitor/manage their own SVM — useful in tenanted environments." },
      { title: "[Upgrade] Enhanced reporting for automated upgrade pre-checks", description: "Errors and warnings from automated pre-upgrade checks are now displayed separately for easier resolution before upgrading." },
    ],
  });

  console.log("Baseline-Daten eingespielt: OceanStor (8 Versionen), FusionCompute (1 Version), NetApp ONTAP (12 Versionen).");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
