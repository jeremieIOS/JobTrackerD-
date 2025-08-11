# 📧 Configuration des Notifications Email

Ce guide explique comment configurer les notifications email pour Job Tracker.

## 🚀 Vue d'ensemble

Le système de notifications email de Job Tracker utilise :
- **Supabase Edge Functions** pour traiter et envoyer les emails
- **Resend** comme service d'envoi d'emails (recommandé)
- **Queue système** pour la fiabilité et les retries automatiques
- **Préférences utilisateur** pour le contrôle granulaire

## ⚙️ Configuration

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit (40,000 emails/mois)
3. Vérifiez votre domaine d'envoi
4. Créez une clé API

### 2. Configurer les secrets Supabase

Dans votre projet Supabase, ajoutez ces secrets :

```bash
# Via le CLI Supabase
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Ou via le Dashboard Supabase
# Project Settings > Edge Functions > Environment Variables
```

**Secrets requis :**
- `RESEND_API_KEY` : Votre clé API Resend
- `SUPABASE_URL` : URL de votre projet (automatique)
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (automatique)

### 3. Déployer les Edge Functions

```bash
# Déployer toutes les fonctions email
supabase functions deploy send-notification-email --no-verify-jwt
supabase functions deploy process-email-queue --no-verify-jwt

# Vérifier le déploiement
supabase functions list
```

### 4. Configurer l'adresse d'expéditeur

Modifiez dans `supabase/functions/send-notification-email/index.ts` :

```typescript
from: 'Job Tracker <noreply@votre-domaine.com>'
```

### 5. Configurer l'URL de l'application

Modifiez dans `supabase/functions/send-notification-email/index.ts` :

```typescript
app_url: 'https://votre-app.vercel.app'
```

## 🔄 Traitement automatique

### Queue système

Le système utilise une queue pour garantir la livraison :

```sql
-- Table email_queue créée automatiquement
-- Statuts : pending, processing, sent, failed
-- Retry automatique jusqu'à 3 fois
```

### Trigger automatique

Quand une notification est créée :
1. **Trigger DB** → Ajoute l'email à la queue
2. **Cron Job** → Traite la queue toutes les minutes
3. **Edge Function** → Envoie l'email via Resend
4. **Mise à jour** → Marque comme envoyé

## 📋 Types de notifications email

| Type | Description | Template |
|------|-------------|----------|
| `job_assigned` | Job assigné à un utilisateur | Bleu avec lien vers le job |
| `job_completed` | Job marqué comme terminé | Vert avec détails |
| `note_added` | Nouvelle note sur un job | Violet avec aperçu |
| `team_invited` | Invitation à rejoindre une équipe | Rouge avec lien |

## 🎛️ Préférences utilisateur

Les utilisateurs peuvent contrôler leurs notifications via **Settings > Notification Preferences** :

- ✅ **Email activé** : Reçoit l'email
- ❌ **Email désactivé** : Pas d'email (notification in-app seulement)
- 🔧 **Granulaire** : Par type de notification

## 🧪 Test local

### 1. Lancer Supabase local

```bash
supabase start
supabase functions serve --no-verify-jwt
```

### 2. Créer des variables d'environnement

```bash
# Dans supabase/functions/.env
RESEND_API_KEY=re_your_test_key
```

### 3. Tester l'envoi

```bash
# Via curl
curl -X POST http://localhost:54321/functions/v1/send-notification-email \
  -H "Content-Type: application/json" \
  -d '{"notification_id": "uuid-here"}'
```

## 🚀 Production

### 1. Configurer un domaine personnalisé

Dans Resend, vérifiez votre domaine :
- DNS records (DKIM, SPF, DMARC)
- Domaine vérifié ✅

### 2. Surveiller la livraison

- **Dashboard Resend** : Statistiques de livraison
- **Logs Supabase** : Erreurs et debug
- **Table email_queue** : Statut des emails

### 3. Limites et quotas

**Resend (gratuit) :**
- 3,000 emails/mois
- 100 emails/jour

**Recommandation production :**
- Plan payant Resend
- Surveillance des quotas
- Gestion des bounces

## 🔧 Dépannage

### Emails non reçus

1. **Vérifier les logs Edge Functions**
   ```bash
   supabase functions logs send-notification-email
   ```

2. **Vérifier la queue**
   ```sql
   SELECT * FROM email_queue WHERE status = 'failed';
   ```

3. **Vérifier Resend Dashboard**
   - Domaine vérifié
   - Quota non dépassé
   - Logs de livraison

### Erreurs communes

| Erreur | Solution |
|--------|----------|
| `RESEND_API_KEY not configured` | Ajouter le secret Supabase |
| `Domain not verified` | Vérifier le domaine dans Resend |
| `Rate limit exceeded` | Upgrade plan Resend |
| `Failed to send email` | Vérifier logs détaillés |

## 📊 Monitoring

### Métriques importantes

```sql
-- Emails envoyés aujourd'hui
SELECT COUNT(*) FROM email_queue 
WHERE status = 'sent' 
AND DATE(processed_at) = CURRENT_DATE;

-- Taux d'échec
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM email_queue 
GROUP BY status;

-- Emails en échec à retry
SELECT * FROM email_queue 
WHERE status = 'failed' 
AND retry_count < 3;
```

## ✅ Checklist de production

- [ ] Domaine vérifié dans Resend
- [ ] Clé API configurée dans Supabase
- [ ] Edge Functions déployées
- [ ] URLs mises à jour
- [ ] Tests de bout en bout
- [ ] Monitoring configuré
- [ ] Préférences utilisateur testées

## 🔗 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Templates email personnalisés](./EMAIL_TEMPLATES.md)

---

**🎉 Une fois configuré, les notifications email fonctionnent automatiquement pour tous les utilisateurs selon leurs préférences !**
