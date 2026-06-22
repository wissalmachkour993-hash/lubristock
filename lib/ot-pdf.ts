function loadImageAsDataURL(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Impossible de créer le canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = "/images/ocp-logo.png.png";
  });
}
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Intervention } from "./types";

const OT_COUNTER_KEY = "ocp-ot-counter";
const RES_COUNTER_KEY = "ocp-reservation-counter";
const UNIT_PRICE_DH = 22;
const HEADER_BG: [number, number, number] = [224, 237, 239];

const FIXED = {
  posteTravailPrincipal: "G-MB-SS Section station service",
  divisionPosteTravail: "BM01 - MINE BENGUERIR",
  posteTechnique: "BM01",
  emplacement: "MC01",
  magasin: "BM01",
};

const OIL_REFERENCE = [
  {
    aliases: ["huile moteur 140", "huile moteur en vrac"],
    sap: "90009702",
    oracle: "10001.00140",
    designation: "HUILE MOTEUR EN VRAC",
  },
  {
    aliases: ["huile reducteur 385", "huile reducteur sae 30"],
    sap: "90009647",
    oracle: "10001.00423",
    designation: "HUILE REDUCTEUR SAE 30",
  },
  {
    aliases: ["huile hydraulique 466", "huile hydraulique c2 sae10w"],
    sap: "90014467",
    oracle: "1000100466",
    designation: "HUILE HYDRAULIQUE C2 SAE10W",
  },
  {
    aliases: ["huile bv 423", "huile p/ transmission mec. sae 80w90"],
    sap: "90014434",
    oracle: "1000100385",
    designation: "HUILE P/ TRANSMISSION MEC. SAE 80W90",
  },
] as const;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getOilArticleData(lubrifiant: string) {
  const key = normalize(lubrifiant);
  const found = OIL_REFERENCE.find((row) => row.aliases.some((a) => normalize(a) === key));
  if (!found) {
    return {
      sap: "N/A",
      oracle: "N/A",
      designation: lubrifiant,
    };
  }
  return { sap: found.sap, oracle: found.oracle, designation: found.designation };
}

function getNextCounter(counterKey: string): number {
  if (typeof window === "undefined") return 1;
  const current = Number(localStorage.getItem(counterKey) ?? "0");
  const next = Number.isFinite(current) && current > 0 ? current + 1 : 1;
  localStorage.setItem(counterKey, String(next));
  return next;
}

function nowDateTime() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

function toUpper(value: string): string {
  return value.toLocaleUpperCase("fr-FR");
}

async function addOcpLogo(doc: jsPDF) {
  if (typeof window === "undefined") return;

  await new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 256;
      canvas.height = img.naturalHeight || 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve();
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngData = canvas.toDataURL("image/png");
      doc.addImage(pngData, "JPEG", 8, 4, 26, 22, undefined, "FAST");
      resolve();
    };
    img.onerror = () => resolve();
    img.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OCP%20logo-x5nfLttde4Q4qAg5RIHltvZYJOE32v.jpg";
  });
}

export async function generateOtPdf(intervention: Intervention, stockPhysiqueAvant: number) {
  const otNumber = getNextCounter(OT_COUNTER_KEY);
  const reservationNumber = getNextCounter(RES_COUNTER_KEY);

  const { sap, oracle, designation } = getOilArticleData(intervention.lubrifiant);
  const quantiteDemandee = intervention.quantite;
  const quantiteInstallee = Math.max(0, stockPhysiqueAvant);
  const montant = quantiteDemandee * UNIT_PRICE_DH;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  await addOcpLogo(doc);

  // Arial n'est pas embarquée par défaut dans jsPDF ; Helvetica est son équivalent métrique.
  doc.setFont("helvetica", "normal");

  doc.setTextColor(22, 101, 52);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  doc.text(`Date d'impression : ${nowDateTime()}`, pageWidth - 10, 15, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("BON DE SORTIE POUR OT", pageWidth / 2, 25, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const typeInterventionLabel =
    intervention.type === "Appoint"
      ? "Appoint d'huile"
      : intervention.type === "Ravitaillement"
        ? "Ravitaillement"
        : "Vidange d'huile";

  const detailsLines: Array<[string, string]> = [
    ["Poste de travail principal", toUpper(FIXED.posteTravailPrincipal)],
    ["Division du poste de travail", toUpper(FIXED.divisionPosteTravail)],
    ["Ordre de travail", toUpper(`${otNumber} ${typeInterventionLabel}`)],
    ["Poste technique", toUpper(FIXED.posteTechnique)],
    ["Equipement", toUpper(intervention.engin || "NI")],
    ["N° d'inventaire", toUpper("NI")],
  ];

  let y = 40;
  detailsLines.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(`${label} :`, 12, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 62, y);
    y += 5.8;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Ordre de transfert", 12, y + 2);

  autoTable(doc, {
    startY: y + 5,
    theme: "grid",
    margin: { left: 8, right: 8 },
    tableLineColor: [160, 160, 160],
    tableLineWidth: 0.12,
    styles: {
      fontSize: 8.6,
      cellPadding: { top: 1.4, right: 1.1, bottom: 1.4, left: 1.1 },
      valign: "middle",
      textColor: 20,
      lineColor: [170, 170, 170],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: HEADER_BG,
      textColor: 20,
      lineColor: [150, 160, 160],
      lineWidth: 0.1,
      halign: "center",
      valign: "middle",
      fontStyle: "normal",
      minCellHeight: 13,
    },
    bodyStyles: { lineColor: [170, 170, 170], lineWidth: 0.1, minCellHeight: 11 },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 24, halign: "center" },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 42, halign: "left" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 18, halign: "right" },
      8: { cellWidth: 20, halign: "right" },
      9: { cellWidth: 18, halign: "center" },
      10: { cellWidth: 12, halign: "center" },
      11: { cellWidth: 22, halign: "center" },
      12: { cellWidth: 18, halign: "center" },
    },
    head: [
      [
        "N° de\nréservation",
        "Date de\nréservation",
        "Code article",
        "Libellé",
        "Lot",
        "Quantité\ndemandée",
        "Quantité\ninstallée",
        "Prix unitaire",
        "Montant",
        "Quantité\nlivrée",
        "Unité",
        "Emplacement",
        "Magasin",
      ],
    ],
    body: [
      [
        String(reservationNumber),
        intervention.date,
        `${sap}\n${oracle}`,
        designation,
        "",
        quantiteDemandee.toFixed(1),
        quantiteInstallee.toFixed(1),
        `${UNIT_PRICE_DH.toFixed(2)} DH`,
        montant.toFixed(2),
        "",
        "KG",
        FIXED.emplacement,
        FIXED.magasin,
      ],
    ],
  });

  const tableEndY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? (y + 25);
  autoTable(doc, {
    startY: tableEndY,
    margin: { left: 8, right: 8 },
    tableLineColor: [160, 160, 160],
    tableLineWidth: 0.12,
    styles: {
      fontSize: 9.2,
      textColor: 20,
      lineColor: [170, 170, 170],
      lineWidth: 0.1,
      cellPadding: { top: 1.3, right: 1.1, bottom: 1.3, left: 1.1 },
    },
    columnStyles: {
      0: { cellWidth: 248 },
      1: { cellWidth: 30, halign: "right" },
    },
    body: [["Total :", montant.toFixed(2)]],
  });

  const totalEndY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? (tableEndY + 6);
  const signatureStartY = totalEndY + 6;
  autoTable(doc, {
    startY: signatureStartY,
    theme: "grid",
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 10,
      halign: "center",
      valign: "middle",
      lineColor: [170, 170, 170],
      lineWidth: 0.15,
      cellPadding: 1.6,
    },
    headStyles: { fillColor: HEADER_BG, textColor: 20, fontStyle: "normal" },
    bodyStyles: { minCellHeight: 20, fillColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    tableLineColor: [160, 160, 160],
    tableLineWidth: 0.15,
    head: [[
      "Le chef du service demandeur\n(signature et cachet)",
      "Le responsable magasin\n(signature et cachet)",
      "Le distributeur\n(signature)",
      "Le prenant\n(matricule, nom, prenom, vise)",
      "Le responsable de saisie (signature)",
    ]],
    body: [["", "", "", "", ""]],
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Page 1 de 1", pageWidth - 10, pageHeight - 6, { align: "right" });

  const safeDate = intervention.date.replace(/[^0-9-]/g, "");
  const fileName = `OT-${otNumber}-${safeDate}.pdf`;
  doc.save(fileName);

  return { otNumber, reservationNumber, fileName };
}

export async function downloadOtPdfFromHistory(
  intervention: Intervention,
  stockPhysiqueAvant: number,
  otNumber: number,
  reservationNumber: number,
  fileName: string
) {
  const currentOt = localStorage.getItem(OT_COUNTER_KEY);
  const currentRes = localStorage.getItem(RES_COUNTER_KEY);
  localStorage.setItem(OT_COUNTER_KEY, String(Math.max(otNumber - 1, 0)));
  localStorage.setItem(RES_COUNTER_KEY, String(Math.max(reservationNumber - 1, 0)));
  try {
    const result = await generateOtPdf(intervention, stockPhysiqueAvant);
    if (result.fileName !== fileName) {
      // On garde le nom courant généré ; la consultation reste fonctionnelle.
    }
  } finally {
    if (currentOt == null) localStorage.removeItem(OT_COUNTER_KEY);
    else localStorage.setItem(OT_COUNTER_KEY, currentOt);
    if (currentRes == null) localStorage.removeItem(RES_COUNTER_KEY);
    else localStorage.setItem(RES_COUNTER_KEY, currentRes);
  }
}

