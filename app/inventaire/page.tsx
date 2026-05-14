"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Header } from "@/components/header";
import { useStore } from "@/lib/store";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { InventoryDashboardRow } from "@/lib/inventory-dashboard.types";
import {
  CITERNE_REFERENCE_ROWS,
  CITERNE_REFERENCE_KG,
  normalizeOilKey,
  type CiterneOilReference,
} from "@/lib/citerne-reference";
import { computeCiterneStockBySap, type GaugeOperation } from "@/lib/citerne-stock";
import type { Intervention } from "@/lib/types";

const AUTONOMIE_CIBLE_JOURS = 21;

function interventionsForRef(ref: CiterneOilReference, interventions: Intervention[]): Intervention[] {
  return interventions.filter((it) =>
    ref.aliases.some((a) => normalizeOilKey(a) === normalizeOilKey(it.lubrifiant))
  );
}

/** Cumuls métier jusqu’à une date inclusive (pour lecture du tableau historique jauge). */
function volumesCumulsJusquaDate(ops: Intervention[], endDate: string): { sorties: number; entrees: number } {
  let sorties = 0;
  let entrees = 0;
  for (const it of ops) {
    if (it.date > endDate) continue;
    if (it.type === "Ravitaillement") entrees += Number(it.quantite) || 0;
    else sorties += Number(it.quantite) || 0;
  }
  return { sorties, entrees };
}

const STOCK_DATA = {
  "HUILE MOTEUR EN VRAC.": { stock_min: 12376, stock_secu: 262, stock_max: 18565, conso_moy: 43.6, delai_appro: 30, prix_unitaire: 35 },
  "HUILE REDUCTEUR SAE 30": { stock_min: 5543, stock_secu: 303, stock_max: 8315, conso_moy: 50.5, delai_appro: 30, prix_unitaire: 44 },
  "HUILE HYDRAULIQUE C2 SAE10W": { stock_min: 10673, stock_secu: 594, stock_max: 16010, conso_moy: 98.9, delai_appro: 30, prix_unitaire: 40 },
  "HUILE P/TRANSMISSION MEC. SAE 80W90": { stock_min: 1722, stock_secu: 12, stock_max: 2583, conso_moy: 1.9, delai_appro: 30, prix_unitaire: 47 },
} as const;

export default function InventairePage() {
  const { interventions, addLubrifiant, gaugeOperations, addGaugeOperation } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGaugeLubrifiantId, setSelectedGaugeLubrifiantId] = useState(
    () => CITERNE_REFERENCE_ROWS[0]?.codeSap ?? ""
  );
  const [gaugeForm, setGaugeForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    lubrifiantId: "",
    quantitePhysique: 0,
    commentaire: "",
  });
  const [formData, setFormData] = useState({
    nom: "",
    stockActuel: 0,
    stockMinimum: 0,
    stockSecurite: 0,
    stockMaximum: 0,
    consommationMoyenne: 0,
    delaiApprovisionnement: 0,
    unite: "KG",
    prixUnitaire: 0,
  });

  const gaugeLubrifiantOptions = CITERNE_REFERENCE_ROWS.map((r) => ({
    id: r.codeSap,
    label: r.description,
  }));

  const stockBySap = useMemo(
    () => computeCiterneStockBySap(gaugeOperations, interventions),
    [gaugeOperations, interventions]
  );

  const inventoryRows = useMemo<InventoryDashboardRow[]>(() => {
    return CITERNE_REFERENCE_ROWS.map((ref) => {
      const stockActuelKg = stockBySap.get(ref.codeSap) ?? CITERNE_REFERENCE_KG;
      const consommationMoyenneKgJour = stockActuelKg > 0 ? stockActuelKg / AUTONOMIE_CIBLE_JOURS : 1;

      return {
        codeSap: ref.codeSap,
        codeOracle: ref.codeOracle,
        description: ref.description,
        stockMinKg: ref.stockMinKg,
        stockMaxKg: ref.stockMaxKg,
        stockActuelKg,
        consommationMoyenneKgJour,
        leadTimeAchatJours: 21,
        leadTimeReceptionJours: 3,
        leadTimeLaboJours: 10,
        couvertureAcc: "Couvert ACC",
        classification: stockActuelKg < ref.stockMinKg ? "Critique" : "Fast",
        dateReceptionIso: null,
        kgEnAnalyseLabo: 0,
        statutLabo: "Disponible",
      };
    });
  }, [stockBySap]);

  const selectedStockData = STOCK_DATA[formData.nom as keyof typeof STOCK_DATA];
  const formPointCommande = selectedStockData
    ? selectedStockData.stock_min + selectedStockData.stock_secu
    : formData.consommationMoyenne * formData.delaiApprovisionnement + formData.stockSecurite;

  const gaugeHistory = useMemo(() => {
    const refById = new Map(CITERNE_REFERENCE_ROWS.map((r) => [r.codeSap, r]));
    return gaugeOperations.map((op) => {
      const ref = refById.get(op.lubrifiantId);
      const scoped = ref ? interventionsForRef(ref, interventions) : [];
      const { sorties, entrees } = volumesCumulsJusquaDate(scoped, op.date);
      const min = ref?.stockMinKg ?? 0;
      const max = ref?.stockMaxKg ?? 0;
      const status = op.quantitePhysique < min ? "Sous minimum" : op.quantitePhysique > max ? "Au-dessus max" : "Dans la plage";
      return {
        ...op,
        lubrifiantNom: ref?.description ?? "Inconnu",
        sortiesCumulKg: sorties,
        entreesCumulKg: entrees,
        ecartVsStockSysteme: op.quantitePhysique - op.stockSystemeAvant,
        stockMin: min,
        stockMax: max,
        status,
        unite: "KG",
      };
    });
  }, [gaugeOperations, interventions]);

  const gaugeChartData = useMemo(
    () =>
      gaugeHistory
        .filter((h) => h.lubrifiantId === selectedGaugeLubrifiantId)
        .slice()
        .sort((a, b) => (a.date > b.date ? 1 : -1))
        .map((h) => ({ date: h.date, physique: h.quantitePhysique, systemeAvant: h.stockSystemeAvant })),
    [gaugeHistory, selectedGaugeLubrifiantId]
  );

  const selectedGaugeRef = CITERNE_REFERENCE_ROWS.find((r) => r.codeSap === selectedGaugeLubrifiantId) ?? null;

  const handleGaugeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = CITERNE_REFERENCE_ROWS.find((r) => r.codeSap === gaugeForm.lubrifiantId);
    if (!ref) return toast.error("Sélectionnez un lubrifiant.");
    if (!gaugeForm.date) return toast.error("Sélectionnez une date.");
    if (!Number.isFinite(gaugeForm.quantitePhysique) || gaugeForm.quantitePhysique < 0) {
      return toast.error("La quantité physique doit être positive.");
    }

    const currentRow = inventoryRows.find((r) => r.codeSap === ref.codeSap);
    const op: GaugeOperation = {
      id: `jauge-${Date.now()}`,
      date: gaugeForm.date,
      lubrifiantId: gaugeForm.lubrifiantId,
      quantitePhysique: gaugeForm.quantitePhysique,
      stockSystemeAvant: currentRow?.stockActuelKg ?? 0,
      commentaire: gaugeForm.commentaire.trim(),
    };
    addGaugeOperation(op);
    setGaugeForm({
      date: new Date().toISOString().slice(0, 10),
      lubrifiantId: "",
      quantitePhysique: 0,
      commentaire: "",
    });
    toast.success("Opération de jauge enregistrée.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLubrifiant({
      id: Date.now().toString(),
      ...formData,
      dateMAJ: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(false);
    setFormData({
      nom: "",
      stockActuel: 0,
      stockMinimum: 0,
      stockSecurite: 0,
      stockMaximum: 0,
      consommationMoyenne: 0,
      delaiApprovisionnement: 0,
      unite: "KG",
      prixUnitaire: 0,
    });
    toast.success("Lubrifiant ajouté.");
  };

  return (
    <AppLayout>
      <Header title="Inventaire" subtitle="Gestion des stocks de lubrifiants" />
      <div className="p-4 md:p-6 space-y-6">
        <InventoryTable
          rows={inventoryRows}
          onAddLubrifiant={() => {
            setIsDialogOpen(true);
            setFormData({
              nom: "",
              stockActuel: 0,
              stockMinimum: 0,
              stockSecurite: 0,
              stockMaximum: 0,
              consommationMoyenne: 0,
              delaiApprovisionnement: 0,
              unite: "KG",
              prixUnitaire: 0,
            });
          }}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un lubrifiant</DialogTitle>
              <DialogDescription>Ajout manuel pour vos besoins de suivi.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Select value={formData.nom} onValueChange={(v) => setFormData((p) => ({ ...p, nom: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un lubrifiant" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STOCK_DATA).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Stock minimum</label>
                  <Input type="number" value={selectedStockData?.stock_min ?? formData.stockMinimum} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock maximum</label>
                  <Input type="number" value={selectedStockData?.stock_max ?? formData.stockMaximum} readOnly />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Point de commande</label>
                <Input type="number" value={Number.isFinite(formPointCommande) ? formPointCommande : 0} readOnly />
              </div>
              <Button type="submit" className="w-full bg-[#1447E6] hover:bg-[#1447E6]/90">
                Ajouter
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#1447E6]" />
              Jauge carburant / Stock physique (avec historique)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleGaugeSubmit} className="grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-5">
              <div className="space-y-1">
                <label className="text-sm font-medium">Date de relevé</label>
                <Input type="date" value={gaugeForm.date} onChange={(e) => setGaugeForm((p) => ({ ...p, date: e.target.value }))} required />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Lubrifiant</label>
                <Select value={gaugeForm.lubrifiantId} onValueChange={(v) => setGaugeForm((p) => ({ ...p, lubrifiantId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un lubrifiant" />
                  </SelectTrigger>
                  <SelectContent>
                    {gaugeLubrifiantOptions.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Qté physique</label>
                <Input type="number" min={0} value={gaugeForm.quantitePhysique} onChange={(e) => setGaugeForm((p) => ({ ...p, quantitePhysique: Number(e.target.value) }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Commentaire</label>
                <Input placeholder="Optionnel" value={gaugeForm.commentaire} onChange={(e) => setGaugeForm((p) => ({ ...p, commentaire: e.target.value }))} />
              </div>
              <div className="md:col-span-5">
                <Button type="submit" className="bg-[#1447E6] hover:bg-[#1447E6]/90">
                  Enregistrer opération de jauge
                </Button>
              </div>
            </form>

            <div className="overflow-x-auto rounded-lg border">
              <div className="border-b bg-muted/10 p-4">
                <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-medium">Évolution des relevés de jauge</p>
                  <div className="w-full md:w-[320px]">
                    <Select value={selectedGaugeLubrifiantId} onValueChange={setSelectedGaugeLubrifiantId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un lubrifiant pour le graphe" />
                      </SelectTrigger>
                      <SelectContent>
                        {gaugeLubrifiantOptions.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="h-[240px] rounded-md border bg-background p-2">
                  {gaugeChartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Aucun point de jauge pour ce lubrifiant.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gaugeChartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={11} />
                        <YAxis fontSize={11} />
                        <Tooltip />
                        {selectedGaugeRef && (
                          <>
                            <ReferenceLine y={selectedGaugeRef.stockMinKg} stroke="#dc2626" strokeDasharray="4 4" />
                            <ReferenceLine y={selectedGaugeRef.stockMaxKg} stroke="#16a34a" strokeDasharray="4 4" />
                          </>
                        )}
                        <Line type="monotone" dataKey="physique" stroke="#2563eb" strokeWidth={2} name="Stock physique" />
                        <Line type="monotone" dataKey="systemeAvant" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" name="Stock système avant" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Lubrifiant</TableHead>
                    <TableHead className="text-right">Stock physique</TableHead>
                    <TableHead className="text-right">Stock système avant</TableHead>
                    <TableHead className="text-right">Sorties cumul. (vid.+appoint)</TableHead>
                    <TableHead className="text-right">Entrées cumul. (ravit.)</TableHead>
                    <TableHead className="text-right">Écart (Physique - Système)</TableHead>
                    <TableHead className="text-right">Seuil min</TableHead>
                    <TableHead className="text-right">Seuil max</TableHead>
                    <TableHead className="text-center">Statut vs seuils</TableHead>
                    <TableHead>Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gaugeHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground">
                        Aucune opération de jauge enregistrée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    gaugeHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="font-medium">{item.lubrifiantNom}</TableCell>
                        <TableCell className="text-right">{item.quantitePhysique.toFixed(1)} KG</TableCell>
                        <TableCell className="text-right">{item.stockSystemeAvant.toFixed(1)} KG</TableCell>
                        <TableCell className="text-right">{item.sortiesCumulKg.toFixed(1)} KG</TableCell>
                        <TableCell className="text-right">{item.entreesCumulKg.toFixed(1)} KG</TableCell>
                        <TableCell className="text-right">{item.ecartVsStockSysteme.toFixed(1)} KG</TableCell>
                        <TableCell className="text-right">{item.stockMin.toFixed(1)} KG</TableCell>
                        <TableCell className="text-right">{item.stockMax.toFixed(1)} KG</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={cn(
                              item.status === "Sous minimum" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                              item.status === "Au-dessus max" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                              item.status === "Dans la plage" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            )}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.commentaire || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

