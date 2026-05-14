import { Lubrifiant, Intervention, Engin, Alerte, HeatmapData, ScheduledLubrication, PredictionStock } from './types';

export const initialLubrifiants: Lubrifiant[] = [
  { id: '1', nom: 'Huile moteur 140', stockActuel: 850, stockMinimum: 200, stockSecurite: 130, stockMaximum: 1400, consommationMoyenne: 28, delaiApprovisionnement: 7, unite: 'L', prixUnitaire: 45, dateMAJ: '2024-01-15' },
  { id: '2', nom: 'Huile hydraulique 466', stockActuel: 1200, stockMinimum: 300, stockSecurite: 180, stockMaximum: 1600, consommationMoyenne: 24, delaiApprovisionnement: 8, unite: 'L', prixUnitaire: 52, dateMAJ: '2024-01-14' },
  { id: '3', nom: 'Huile BV 423', stockActuel: 180, stockMinimum: 150, stockSecurite: 90, stockMaximum: 620, consommationMoyenne: 10, delaiApprovisionnement: 10, unite: 'L', prixUnitaire: 68, dateMAJ: '2024-01-13' },
  { id: '4', nom: 'Huile reducteur 385', stockActuel: 95, stockMinimum: 100, stockSecurite: 70, stockMaximum: 580, consommationMoyenne: 11, delaiApprovisionnement: 9, unite: 'L', prixUnitaire: 75, dateMAJ: '2024-01-12' },
  { id: '5', nom: 'Graisse cat', stockActuel: 450, stockMinimum: 100, stockSecurite: 80, stockMaximum: 700, consommationMoyenne: 8, delaiApprovisionnement: 12, unite: 'kg', prixUnitaire: 32, dateMAJ: '2024-01-11' },
  { id: '6', nom: 'Liquide de refroidissement', stockActuel: 50, stockMinimum: 80, stockSecurite: 60, stockMaximum: 500, consommationMoyenne: 7, delaiApprovisionnement: 6, unite: 'L', prixUnitaire: 28, dateMAJ: '2024-01-10' },
];

export const initialInterventions: Intervention[] = [
  { id: '1', date: '2024-01-15', engin: 'D9R2', categorie: 'Bulle D9R', lubrifiant: 'Huile moteur 140', compteurHoraire: 12500, type: 'Vidange', quantite: 45, responsable: 'Mohamed Alami', observation: 'RAS' },
  { id: '2', date: '2024-01-15', engin: 'KOM1', categorie: 'Camion 190T', lubrifiant: 'Huile reducteur 385', compteurHoraire: 8900, type: 'Appoint', quantite: 12, responsable: 'Ahmed Benali', observation: 'Niveau bas' },
  { id: '3', date: '2024-01-14', engin: 'CH992K', categorie: 'Chargeuse', lubrifiant: 'Huile hydraulique 466', compteurHoraire: 15200, type: 'Vidange', quantite: 85, responsable: 'Youssef Tazi', observation: 'Changement filtre' },
  { id: '4', date: '2024-01-14', engin: 'D11T1', categorie: 'D9T', lubrifiant: 'Huile moteur 140', compteurHoraire: 9800, type: 'Appoint', quantite: 15, responsable: 'Hassan Idrissi', observation: '' },
  { id: '5', date: '2024-01-13', engin: 'HP21', categorie: 'Camion 136T', lubrifiant: 'Huile moteur 140', compteurHoraire: 22100, type: 'Vidange', quantite: 52, responsable: 'Mohamed Alami', observation: 'Usure normale' },
  { id: '6', date: '2024-01-13', engin: 'Niv 5 KOM', categorie: 'Nivelouse', lubrifiant: 'Huile hydraulique 466', compteurHoraire: 6700, type: 'Appoint', quantite: 8, responsable: 'Omar Fassi', observation: 'Fuite mineure corrigée' },
  { id: '7', date: '2024-01-12', engin: 'SKF1', categorie: 'Moyens de servitude', lubrifiant: 'Huile hydraulique 466', compteurHoraire: 4500, type: 'Vidange', quantite: 25, responsable: 'Ahmed Benali', observation: '' },
  { id: '8', date: '2024-01-12', engin: 'DKS', categorie: 'Sendeuse', lubrifiant: 'Huile moteur 140', compteurHoraire: 3200, type: 'Appoint', quantite: 6, responsable: 'Karim Benjelloun', observation: '' },
  { id: '9', date: '2024-01-11', engin: 'D9R5', categorie: 'Bulle D9R', lubrifiant: 'Huile moteur 140', compteurHoraire: 18900, type: 'Vidange', quantite: 45, responsable: 'Youssef Tazi', observation: 'Maintenance préventive' },
  { id: '10', date: '2024-01-11', engin: 'KOM3', categorie: 'Camion 190T', lubrifiant: 'Graisse cat', compteurHoraire: 11200, type: 'Appoint', quantite: 5, responsable: 'Hassan Idrissi', observation: 'Points de graissage' },
  { id: '11', date: '2024-01-10', engin: 'PAY KO 564238', categorie: 'Pay dozer', lubrifiant: 'Huile hydraulique 466', compteurHoraire: 7800, type: 'Vidange', quantite: 65, responsable: 'Mohamed Alami', observation: '' },
  { id: '12', date: '2024-01-10', engin: 'Camion.CAT (rav)', categorie: 'Moyens de servitude', lubrifiant: 'Huile moteur 140', compteurHoraire: 5600, type: 'Appoint', quantite: 10, responsable: 'Omar Fassi', observation: '' },
];

export const initialEngins: Engin[] = [
  { id: '1', nom: 'D9R2', categorie: 'Bulle D9R', lubrifiantRecommande: 'Huile moteur 140', heuresService: 12500, statut: 'Actif', derniereLubrification: '2024-01-15', healthScore: 'Bon', efficiencyIndex: 92, consommationMoyenne: 3.2, prochaineLubrification: '2024-02-15' },
  { id: '2', nom: 'D9R5', categorie: 'Bulle D9R', lubrifiantRecommande: 'Huile moteur 140', heuresService: 18900, statut: 'Actif', derniereLubrification: '2024-01-11', healthScore: 'Moyen', efficiencyIndex: 78, consommationMoyenne: 4.8, prochaineLubrification: '2024-02-11' },
  { id: '3', nom: 'KOM1', categorie: 'Camion 190T', lubrifiantRecommande: 'Huile reducteur 385', heuresService: 8900, statut: 'Actif', derniereLubrification: '2024-01-15', healthScore: 'Bon', efficiencyIndex: 88, consommationMoyenne: 2.8, prochaineLubrification: '2024-02-15' },
  { id: '4', nom: 'KOM2', categorie: 'Camion 190T', lubrifiantRecommande: 'Liquide de refroidissement', heuresService: 7500, statut: 'En maintenance', derniereLubrification: '2024-01-08', healthScore: 'Critique', efficiencyIndex: 45, consommationMoyenne: 6.2, prochaineLubrification: '2024-01-20' },
  { id: '5', nom: 'KOM3', categorie: 'Camion 190T', lubrifiantRecommande: 'Graisse cat', heuresService: 11200, statut: 'Actif', derniereLubrification: '2024-01-11', healthScore: 'Bon', efficiencyIndex: 91, consommationMoyenne: 2.1, prochaineLubrification: '2024-02-11' },
  { id: '6', nom: 'CH992K', categorie: 'Chargeuse', lubrifiantRecommande: 'Huile hydraulique 466', heuresService: 15200, statut: 'Actif', derniereLubrification: '2024-01-14', healthScore: 'Bon', efficiencyIndex: 85, consommationMoyenne: 4.2, prochaineLubrification: '2024-02-14' },
  { id: '7', nom: 'D11T1', categorie: 'D9T', lubrifiantRecommande: 'Huile moteur 140', heuresService: 9800, statut: 'Actif', derniereLubrification: '2024-01-14', healthScore: 'Bon', efficiencyIndex: 89, consommationMoyenne: 3.5, prochaineLubrification: '2024-02-14' },
  { id: '8', nom: 'HP21', categorie: 'Camion 136T', lubrifiantRecommande: 'Huile moteur 140', heuresService: 22100, statut: 'Actif', derniereLubrification: '2024-01-13', healthScore: 'Moyen', efficiencyIndex: 72, consommationMoyenne: 5.1, prochaineLubrification: '2024-02-13' },
  { id: '9', nom: 'Niv 5 KOM', categorie: 'Nivelouse', lubrifiantRecommande: 'Huile hydraulique 466', heuresService: 6700, statut: 'Actif', derniereLubrification: '2024-01-13', healthScore: 'Bon', efficiencyIndex: 94, consommationMoyenne: 1.8, prochaineLubrification: '2024-02-13' },
  { id: '10', nom: 'SKF1', categorie: 'Moyens de servitude', lubrifiantRecommande: 'Huile hydraulique 466', heuresService: 4500, statut: 'Actif', derniereLubrification: '2024-01-12', healthScore: 'Bon', efficiencyIndex: 96, consommationMoyenne: 1.2, prochaineLubrification: '2024-02-12' },
  { id: '11', nom: 'DKS', categorie: 'Sendeuse', lubrifiantRecommande: 'Huile moteur 140', heuresService: 3200, statut: 'Actif', derniereLubrification: '2024-01-12', healthScore: 'Bon', efficiencyIndex: 93, consommationMoyenne: 1.5, prochaineLubrification: '2024-02-12' },
  { id: '12', nom: 'PAY KO 564238', categorie: 'Pay dozer', lubrifiantRecommande: 'Huile hydraulique 466', heuresService: 7800, statut: 'Actif', derniereLubrification: '2024-01-10', healthScore: 'Moyen', efficiencyIndex: 75, consommationMoyenne: 3.8, prochaineLubrification: '2024-02-10' },
  { id: '13', nom: 'D11T2', categorie: 'D9T', lubrifiantRecommande: 'Huile moteur 140', heuresService: 8200, statut: 'Inactif', derniereLubrification: '2024-01-05', healthScore: 'Critique', efficiencyIndex: 52, consommationMoyenne: 5.8, prochaineLubrification: '2024-01-25' },
  { id: '14', nom: 'Camion.CAT (rav)', categorie: 'Moyens de servitude', lubrifiantRecommande: 'Huile moteur 140', heuresService: 5600, statut: 'Actif', derniereLubrification: '2024-01-10', healthScore: 'Bon', efficiencyIndex: 87, consommationMoyenne: 2.3, prochaineLubrification: '2024-02-10' },
  { id: '15', nom: 'D9R7', categorie: 'Bulle D9R', lubrifiantRecommande: 'Huile moteur 140', heuresService: 14300, statut: 'Actif', derniereLubrification: '2024-01-09', healthScore: 'Bon', efficiencyIndex: 83, consommationMoyenne: 3.9, prochaineLubrification: '2024-02-09' },
];

export const initialAlertes: Alerte[] = [
  { id: '1', type: 'stock_critique', message: 'Stock critique: Liquide de refroidissement (50L restants)', date: '2024-01-15', lu: false, lubrifiantId: '6' },
  { id: '2', type: 'stock_faible', message: 'Stock faible: Huile reducteur 385 (95L restants)', date: '2024-01-15', lu: false, lubrifiantId: '4' },
  { id: '3', type: 'stock_faible', message: 'Stock faible: Huile BV 423 (180L restants)', date: '2024-01-14', lu: true, lubrifiantId: '3' },
  { id: '4', type: 'maintenance', message: 'KOM2 en maintenance depuis 7 jours', date: '2024-01-14', lu: false, enginId: '4' },
  { id: '5', type: 'anomalie', message: 'Consommation anormale détectée sur D9R5', date: '2024-01-13', lu: true, enginId: '2' },
];

// Données de consommation mensuelle
export const consommationMensuelle = [
  { mois: 'Jan', vidange: 245, appoint: 68 },
  { mois: 'Fév', vidange: 198, appoint: 52 },
  { mois: 'Mar', vidange: 267, appoint: 78 },
  { mois: 'Avr', vidange: 234, appoint: 61 },
  { mois: 'Mai', vidange: 289, appoint: 85 },
  { mois: 'Jun', vidange: 312, appoint: 92 },
  { mois: 'Jul', vidange: 278, appoint: 73 },
  { mois: 'Août', vidange: 256, appoint: 65 },
  { mois: 'Sep', vidange: 301, appoint: 88 },
  { mois: 'Oct', vidange: 287, appoint: 76 },
  { mois: 'Nov', vidange: 265, appoint: 70 },
  { mois: 'Déc', vidange: 298, appoint: 82 },
];

// Distribution par type de lubrifiant
export const distributionLubrifiants = [
  { name: 'Huile moteur 140', value: 35, color: '#1447E6' },
  { name: 'Huile hydraulique 466', value: 28, color: '#0088bb' },
  { name: 'Huile reducteur 385', value: 15, color: '#22c55e' },
  { name: 'Graisse cat', value: 12, color: '#f59e0b' },
  { name: 'Huile BV 423', value: 7, color: '#ef4444' },
  { name: 'Liquide refroid.', value: 3, color: '#8b5cf6' },
];

// Consommation par catégorie d'engin
export const consommationParCategorie = [
  { categorie: 'Bulle D9R', consommation: 420 },
  { categorie: 'Camion 190T', consommation: 380 },
  { categorie: 'Camion 136T', consommation: 290 },
  { categorie: 'Chargeuse', consommation: 245 },
  { categorie: 'D9T', consommation: 210 },
  { categorie: 'Nivelouse', consommation: 165 },
  { categorie: 'Pay dozer', consommation: 145 },
  { categorie: 'Sendeuse', consommation: 98 },
  { categorie: 'Moyens de servitude', consommation: 87 },
];

// Top 5 équipements consommateurs
export const topEquipements = [
  { engin: 'D9R5', consommation: 156, heures: 18900 },
  { engin: 'HP21', consommation: 142, heures: 22100 },
  { engin: 'CH992K', consommation: 128, heures: 15200 },
  { engin: 'D9R2', consommation: 115, heures: 12500 },
  { engin: 'KOM1', consommation: 98, heures: 8900 },
];

// Données Heatmap consommation par machine
export const heatmapData: HeatmapData[] = [
  { engin: 'D9R2', semaine1: 45, semaine2: 38, semaine3: 52, semaine4: 41 },
  { engin: 'D9R5', semaine1: 62, semaine2: 58, semaine3: 48, semaine4: 55 },
  { engin: 'KOM1', semaine1: 28, semaine2: 35, semaine3: 32, semaine4: 38 },
  { engin: 'KOM2', semaine1: 15, semaine2: 0, semaine3: 0, semaine4: 0 },
  { engin: 'KOM3', semaine1: 22, semaine2: 18, semaine3: 25, semaine4: 20 },
  { engin: 'CH992K', semaine1: 48, semaine2: 52, semaine3: 45, semaine4: 50 },
  { engin: 'D11T1', semaine1: 35, semaine2: 42, semaine3: 38, semaine4: 40 },
  { engin: 'HP21', semaine1: 55, semaine2: 48, semaine3: 58, semaine4: 52 },
  { engin: 'Niv 5 KOM', semaine1: 18, semaine2: 22, semaine3: 15, semaine4: 20 },
  { engin: 'SKF1', semaine1: 12, semaine2: 15, semaine3: 10, semaine4: 14 },
];

// Planification des lubrifications
export const scheduledLubrifications: ScheduledLubrication[] = [
  { id: '1', enginId: '1', enginNom: 'D9R2', date: '2024-01-20', lubrifiant: 'Huile moteur 140', type: 'Appoint', quantiteEstimee: 15, status: 'planifie' },
  { id: '2', enginId: '3', enginNom: 'KOM1', date: '2024-01-22', lubrifiant: 'Huile reducteur 385', type: 'Vidange', quantiteEstimee: 45, status: 'planifie' },
  { id: '3', enginId: '6', enginNom: 'CH992K', date: '2024-01-18', lubrifiant: 'Huile hydraulique 466', type: 'Appoint', quantiteEstimee: 20, status: 'retard' },
  { id: '4', enginId: '8', enginNom: 'HP21', date: '2024-01-25', lubrifiant: 'Huile moteur 140', type: 'Vidange', quantiteEstimee: 52, status: 'planifie' },
  { id: '5', enginId: '2', enginNom: 'D9R5', date: '2024-01-19', lubrifiant: 'Huile moteur 140', type: 'Appoint', quantiteEstimee: 18, status: 'planifie' },
  { id: '6', enginId: '7', enginNom: 'D11T1', date: '2024-01-15', lubrifiant: 'Huile moteur 140', type: 'Appoint', quantiteEstimee: 12, status: 'complete' },
];

// Prédictions de rupture de stock
export const stockPredictions: PredictionStock[] = [
  { lubrifiant: 'Liquide de refroidissement', joursRestants: 5, dateRupture: '2024-01-20', consommationJournaliere: 10 },
  { lubrifiant: 'Huile reducteur 385', joursRestants: 12, dateRupture: '2024-01-27', consommationJournaliere: 8 },
  { lubrifiant: 'Huile BV 423', joursRestants: 18, dateRupture: '2024-02-02', consommationJournaliere: 10 },
];

// Pareto data (Top machines consommatrices avec cumul)
export const paretoData = [
  { engin: 'D9R5', consommation: 156, cumul: 18.2 },
  { engin: 'HP21', consommation: 142, cumul: 34.8 },
  { engin: 'CH992K', consommation: 128, cumul: 49.7 },
  { engin: 'D9R2', consommation: 115, cumul: 63.1 },
  { engin: 'KOM1', consommation: 98, cumul: 74.5 },
  { engin: 'D11T1', consommation: 85, cumul: 84.5 },
  { engin: 'D9R7', consommation: 72, cumul: 92.9 },
  { engin: 'Autres', consommation: 61, cumul: 100 },
];

// Consommation vs heures machine
export const consumptionVsHours = [
  { engin: 'D9R5', heures: 18900, consommation: 156, ratio: 0.0082 },
  { engin: 'HP21', heures: 22100, consommation: 142, ratio: 0.0064 },
  { engin: 'CH992K', heures: 15200, consommation: 128, ratio: 0.0084 },
  { engin: 'D9R2', heures: 12500, consommation: 115, ratio: 0.0092 },
  { engin: 'KOM1', heures: 8900, consommation: 98, ratio: 0.0110 },
  { engin: 'D11T1', heures: 9800, consommation: 85, ratio: 0.0087 },
  { engin: 'D9R7', heures: 14300, consommation: 72, ratio: 0.0050 },
  { engin: 'KOM3', heures: 11200, consommation: 65, ratio: 0.0058 },
  { engin: 'PAY KO', heures: 7800, consommation: 58, ratio: 0.0074 },
  { engin: 'Niv 5', heures: 6700, consommation: 45, ratio: 0.0067 },
];

// Comparaison périodes
export const periodComparison = {
  semaineActuelle: { vidange: 85, appoint: 32, total: 117 },
  semainePrecedente: { vidange: 78, appoint: 28, total: 106 },
  moisActuel: { vidange: 312, appoint: 98, total: 410 },
  moisPrecedent: { vidange: 289, appoint: 85, total: 374 },
};
