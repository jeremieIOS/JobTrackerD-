# ♻️ Guide des Jobs Récurrents

Ce guide explique comment utiliser le système de récurrence de jobs dans Job Tracker.

## 🎯 Vue d'ensemble

Le système de récurrence permet de créer des jobs qui se répètent automatiquement selon un planning défini. Parfait pour :
- **Maintenance quotidienne** (vérifications, rapports)
- **Réunions hebdomadaires** (équipe, clients)
- **Tâches mensuelles** (facturation, audits)

## ✨ Fonctionnalités

### **Types de récurrence**
- ⏰ **Quotidien** : Chaque jour ou tous les X jours
- 📅 **Hebdomadaire** : Jours spécifiques de la semaine
- 📆 **Mensuel** : Jour spécifique du mois

### **Options avancées**
- **Intervalle personnalisé** : Tous les 2 jours, 3 semaines, etc.
- **Jours de la semaine** : Lun-Mer-Ven pour hebdomadaire
- **Jour du mois** : 15ème de chaque mois
- **Date de fin** : Arrêt automatique (futur)

## 🔧 Comment utiliser

### **1. Créer un job récurrent**

1. **Clique "New Job"** dans l'interface
2. **Remplis les détails** (titre, description, etc.)
3. **Active "Recurring Job"** (toggle)
4. **Configure la récurrence** :
   - Type : Daily/Weekly/Monthly
   - Intervalle : Tous les X
   - Spécifications (jours, date)
5. **Clique "Create"**

### **2. Comprendre les indicateurs**

**Badge violet "Recurring"** = Job template (générateur)
**Badge bleu "Auto-generated"** = Instance créée automatiquement

### **3. Gestion des instances**

- **Job template** : Modifie le planning (title, description)
- **Instances générées** : Jobs normaux, indépendants
- **Suppression template** : Arrête la génération future

## 📋 Exemples pratiques

### **Rapport quotidien**
```
Type: Daily
Interval: 1
→ "Chaque jour"
```

### **Réunion équipe (Lun-Mer-Ven)**
```
Type: Weekly  
Interval: 1
Days: Monday, Wednesday, Friday
→ "Chaque semaine les Lun, Mer, Ven"
```

### **Facturation mensuelle**
```
Type: Monthly
Interval: 1  
Day of month: 1st
→ "Chaque mois le 1er"
```

### **Audit trimestriel**
```
Type: Monthly
Interval: 3
Day of month: 15th  
→ "Tous les 3 mois le 15"
```

## ⚙️ Traitement automatique

### **Génération des instances**
- **Quand** : Cron job toutes les heures
- **Logic** : Fonction PostgreSQL `generate_recurring_jobs()`
- **Condition** : `next_occurrence <= NOW()`

### **Edge Function**
```typescript
// supabase/functions/process-recurring-jobs/index.ts
// Appelé par cron job ou manuellement
```

### **Nettoyage automatique**
- **Jobs terminés** : Supprimés après 30 jours
- **Templates uniquement** : Instances générées nettoyées

## 🗄️ Structure base de données

### **Champs ajoutés à `jobs`**
```sql
is_recurring BOOLEAN         -- Template récurrent
recurrence_pattern JSONB     -- Configuration
parent_job_id UUID          -- Référence template
next_occurrence TIMESTAMPTZ -- Prochaine génération  
recurrence_end_date TIMESTAMPTZ -- Fin (futur)
```

### **Pattern JSON**
```json
{
  "type": "weekly",
  "interval": 2,
  "days_of_week": [1, 3, 5]  // Lun, Mer, Ven
}

{
  "type": "monthly", 
  "interval": 1,
  "day_of_month": 15
}
```

## 🔄 Workflow complet

```mermaid
graph TD
    A[Créer Job Récurrent] --> B[Template Stocké]
    B --> C[Cron Job Hourly]
    C --> D[generate_recurring_jobs()]
    D --> E{next_occurrence <= NOW()?}
    E -->|Oui| F[Créer Instance]
    E -->|Non| G[Attendre]
    F --> H[Calculer Prochaine Occurrence]
    H --> I[Mettre à Jour Template]
    I --> C
```

## 🧪 Test local

### **1. Créer un job récurrent**
- Type: Daily, Every 1 day
- Vérifie le badge "Recurring"

### **2. Simuler génération**
```sql
-- Dans Supabase SQL Editor
SELECT generate_recurring_jobs();
```

### **3. Vérifier instances**
- Refresh l'interface
- Nouveaux jobs avec badge "Auto-generated"

## 🚀 Déploiement production

### **1. Déployer Edge Function**
```bash
supabase functions deploy process-recurring-jobs --no-verify-jwt
```

### **2. Configurer Cron Job**
- **GitHub Actions** : Workflow programmé
- **Vercel Cron** : API routes
- **Service externe** : Zapier, etc.

### **3. Exemple Cron (GitHub)**
```yaml
# .github/workflows/recurring-jobs.yml
name: Process Recurring Jobs
on:
  schedule:
    - cron: '0 * * * *'  # Toutes les heures
jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/process-recurring-jobs \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

## 📊 Monitoring

### **Statistiques SQL**
```sql
-- Jobs récurrents actifs
SELECT COUNT(*) FROM jobs WHERE is_recurring = true;

-- Instances générées aujourd'hui  
SELECT COUNT(*) FROM jobs 
WHERE parent_job_id IS NOT NULL 
AND DATE(created_at) = CURRENT_DATE;

-- Prochaines générations
SELECT title, next_occurrence 
FROM jobs 
WHERE is_recurring = true 
ORDER BY next_occurrence;
```

### **Logs Edge Function**
```bash
supabase functions logs process-recurring-jobs
```

## ⚠️ Limitations actuelles

- **Édition templates** : Modifications ne s'appliquent qu'aux futures instances
- **Timezone** : UTC uniquement (pas de gestion timezone)
- **Date de fin** : Interface pas encore implémentée
- **Cron externe** : Pas de cron Supabase natif

## 🔮 Améliorations futures

- **Interface gestion** : Page dédiée templates récurrents
- **Timezone support** : Récurrence locale utilisateur
- **Conditions avancées** : Sauf jours fériés, conditions méteo
- **Notifications** : Alerte avant génération
- **Bulk operations** : Actions sur groupes d'instances

---

## ✅ **Récurrence opérationnelle !**

**Le système génère automatiquement les jobs selon leur planning. Les utilisateurs voient les badges "Recurring" et "Auto-generated" pour distinguer templates et instances.** 🎉
