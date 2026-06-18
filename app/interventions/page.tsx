"use client";

import { AppLayout } from "@/components/app-layout";
import { Header } from "@/components/header";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Wrench, Droplets, RefreshCw, Filter } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, LUBRIFIANTS_TYPES, CATEGORY_ENGINES_MAP, EQUIPMENT_MAPPINGS } from "@/lib/types";
import { addOtHistoryEntry } from "@/lib/ot-history";

type InterventionSoumiseType = "Vidange" | "Appoint";

export default function InterventionsPage() {
 const { lubrifiants, interventions, addIntervention, addAlerte } = useStore();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    engin: "",
    categorie: "",
    lubrifiant: "",
    compteurHoraire: 0,
    type: "Vidange" as InterventionSoumiseType,
    quantite: 0,
    responsable: "",
    observation: "",
  });

  const availableEngins = formData.categorie ? (CATEGORY_ENGINES_MAP[formData.categorie] ?? []) : [];

  const filteredInterventions = interventions.filter((i) => {
    const matchesSearch =
      i.engin.toLowerCase().includes(search.toLowerCase()) ||
      i.lubrifiant.toLowerCase().includes(search.toLowerCase()) ||
      i.responsable.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "all" || i.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lubrifiant = lubrifiants.find((l) => l.nom === formData.lubrifiant);

    const sortieCuve =
      formData.type === "Vidange" || formData.type === "Appoint";
    
    const stockInsuffisant =
      sortieCuve &&
      lubrifiant &&
      Number(lubrifiant.stockActuel) < Number(formData.quantite);
    
    const observationStock = stockInsuffisant && lubrifiant
      ? `⚠ Stock insuffisant lors de l'intervention. Stock disponible : ${lubrifiant.stockActuel} ${lubrifiant.unite}. Quantité déclarée : ${formData.quantite} ${lubrifiant.unite}. Intervention déjà réalisée sur le terrain. Remplissage de la citerne requis.`
      : "";
    
    const interventionPayload = {
      id: Date.now().toString(),
      ...formData,
      observation: stockInsuffisant
        ? formData.observation
          ? `${formData.observation} | ${observationStock}`
          : observationStock
        : formData.observation,
    };
    
    addIntervention(interventionPayload);
    
    if (stockInsuffisant && lubrifiant) {
      addAlerte({
        id: `alerte-stock-${Date.now()}`,
        type: "stock_critique",
        message: `Stock insuffisant pour ${lubrifiant.nom}. L'intervention a été enregistrée malgré un stock disponible de ${lubrifiant.stockActuel} ${lubrifiant.unite}. Remplissage de la citerne requis.`,
        date: new Date().toISOString().slice(0, 10),
        lu: false,
      });
    
      toast.warning(
        "Intervention enregistrée, mais stock insuffisant. Remplissage de la citerne requis."
      );
    }
    if (typeof window !== "undefined") {
      const savedInterventions = JSON.parse(
        localStorage.getItem("lubriocp_interventions") || "[]"
      );
    
      const updatedInterventions = [interventionPayload, ...savedInterventions];
    
      localStorage.setItem(
        "lubriocp_interventions",
        JSON.stringify(updatedInterventions)
      );
    
      window.dispatchEvent(new Event("lubriocp_interventions_updated"));
    }
    const stockPhysiqueAvant = lubrifiant?.stockActuel ?? 0;
    try {
      const { generateOtPdf } = await import("@/lib/ot-pdf");
      const counters = await generateOtPdf(interventionPayload, stockPhysiqueAvant);
      addOtHistoryEntry({
        fileName: counters.fileName,
        otNumber: counters.otNumber,
        reservationNumber: counters.reservationNumber,
        stockPhysiqueAvant,
        intervention: interventionPayload,
      });
      if (!stockInsuffisant) {
        toast.success(
          `Intervention enregistrée avec succès. OT #${counters.otNumber} / Réservation #${counters.reservationNumber} généré.`
        );
      } else {
        toast.warning(
          `Intervention enregistrée avec stock insuffisant. OT #${counters.otNumber} / Réservation #${counters.reservationNumber} généré. Remplissage de la citerne requis.`
        );
      }
    } catch {
      toast.warning(
        stockInsuffisant
          ? "Intervention enregistrée avec stock insuffisant. Génération OT PDF échouée. Remplissage de la citerne requis."
          : "Intervention enregistrée, mais la génération OT PDF a échoué."
      );
    }

    setIsDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      engin: "",
      categorie: "",
      lubrifiant: "",
      compteurHoraire: 0,
      type: "Vidange",
      quantite: 0,
      responsable: "",
      observation: "",
    });
  };

  return (
    <AppLayout>
      <Header
        title="Interventions"
        subtitle="Historique et enregistrement des interventions"
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {interventions.filter((i) => i.type === "Vidange").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Vidanges</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {interventions.filter((i) => i.type === "Appoint").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Appoints</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{interventions.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {interventions.reduce((acc, i) => acc + i.quantite, 0)} kg
                  </p>
                  <p className="text-xs text-muted-foreground">Consommé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 flex-1 w-full md:w-auto">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="Vidange">Vidanges</SelectItem>
                    <SelectItem value="Appoint">Appoints</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-[#1447E6] hover:bg-[#1447E6]/90"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle intervention
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Enregistrer une intervention</DialogTitle>
                    <DialogDescription>Les interventions prises en charge sont : Vidange et Appoint.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type d&apos;intervention</label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: InterventionSoumiseType) =>
                            setFormData({ ...formData, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vidange">Vidange</SelectItem>
                            <SelectItem value="Appoint">Appoint</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Catégorie</label>
                        <Select
                          value={formData.categorie}
                          onValueChange={(value) => setFormData({ ...formData, categorie: value, engin: "" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Engin</label>
                        <Select
                          value={formData.engin}
                          onValueChange={(value) => {
                            const mapping = EQUIPMENT_MAPPINGS[value];
                            if (mapping) {
                              setFormData({
                                ...formData,
                                engin: value,
                                categorie: mapping.categorie,
                                lubrifiant: mapping.lubrifiant,
                              });
                              return;
                            }
                            setFormData({ ...formData, engin: value });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formData.categorie ? "Sélectionner un engin" : "Choisir une catégorie d'abord"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableEngins.map((engin) => (
                              <SelectItem key={engin} value={engin}>
                                {engin}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Lubrifiant</label>
                        <Select
                          value={formData.lubrifiant}
                          onValueChange={(value) => setFormData({ ...formData, lubrifiant: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un lubrifiant" />
                          </SelectTrigger>
                          <SelectContent>
                            {LUBRIFIANTS_TYPES.map((lub) => (
                              <SelectItem key={lub} value={lub}>
                                {lub}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Compteur horaire</label>
                        <Input
                          type="number"
                          value={formData.compteurHoraire}
                          onChange={(e) =>
                            setFormData({ ...formData, compteurHoraire: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Quantité (kg)</label>
                        <Input
                          type="number"
                          value={formData.quantite}
                          onChange={(e) =>
                            setFormData({ ...formData, quantite: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Responsable</label>
                        <Input
                          value={formData.responsable}
                          onChange={(e) =>
                            setFormData({ ...formData, responsable: e.target.value })
                          }
                          placeholder="Nom du responsable"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Observation</label>
                      <Textarea
                        value={formData.observation}
                        onChange={(e) =>
                          setFormData({ ...formData, observation: e.target.value })
                        }
                        placeholder="Notes ou observations..."
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#1447E6] hover:bg-[#1447E6]/90">
                      Enregistrer l&apos;intervention
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#1447E6]" />
              Historique des interventions
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Engin</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Lubrifiant</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Compteur</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Observation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterventions.map((intervention) => (
                  <TableRow key={intervention.id}>
                    <TableCell>{intervention.date}</TableCell>
                    <TableCell className="font-medium">{intervention.engin}</TableCell>
                    <TableCell>{intervention.categorie}</TableCell>
                    <TableCell>{intervention.lubrifiant}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          intervention.type === "Vidange"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : intervention.type === "Appoint"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-400"
                        }
                      >
                        {intervention.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{intervention.quantite} kg</TableCell>
                    <TableCell className="text-right">{intervention.compteurHoraire}h</TableCell>
                    <TableCell>{intervention.responsable}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {intervention.observation || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
