# 🗺️ Guide d'Activation Google Maps APIs

## 🚨 **URGENT : APIs À ACTIVER**

Basé sur les erreurs dans l'image, voici les étapes **OBLIGATOIRES** :

### **📍 1. GEOCODING API (PRIORITY 1)**
**Erreur actuelle :** `GEOCODER_GEOCODE: REQUEST_DENIED`

**Solution :**
1. Aller sur : https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
2. Sélectionner votre projet Google Cloud
3. Cliquer sur **"ENABLE"**
4. Attendre la confirmation d'activation

### **🗺️ 2. PLACES API (New) (PRIORITY 2)**
**Erreur actuelle :** `You're calling a legacy API`

**Solution :**
1. Aller sur : https://console.cloud.google.com/apis/library/places-backend.googleapis.com
2. Sélectionner votre projet
3. Cliquer sur **"ENABLE"**
4. Désactiver l'ancienne Places API si activée

### **📱 3. MAPS JAVASCRIPT API (Vérification)**
**Status :** Probablement déjà activée

**Vérification :**
1. Aller sur : https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
2. Vérifier qu'elle est bien **"ENABLED"**

---

## 🔧 **ÉTAPES DÉTAILLÉES**

### **Step 1 : Accéder à Google Cloud Console**
```bash
# Ouvrir dans le navigateur
https://console.cloud.google.com/
```

### **Step 2 : Sélectionner le bon projet**
- Cliquer sur le sélecteur de projet (en haut)
- Choisir le projet qui contient votre API key actuelle

### **Step 3 : Aller dans "APIs & Services"**
1. Menu hamburger → **"APIs & Services"** → **"Library"**
2. Ou utiliser les liens directs ci-dessus

### **Step 4 : Activer chaque API**
Pour chaque API :
1. Cliquer sur l'API dans la library
2. Cliquer sur **"ENABLE"**
3. Attendre la confirmation (1-2 minutes)

---

## 💳 **BILLING & QUOTAS**

### **Vérifier le Billing :**
1. Menu → **"Billing"** → **"My projects"**
2. Vérifier que votre projet a un compte de facturation actif
3. Si non : associer un compte de facturation

### **Vérifier les Quotas :**
1. Menu → **"APIs & Services"** → **"Quotas"**
2. Rechercher "Geocoding API", "Places API", "Maps JavaScript API"
3. Vérifier que les quotas ne sont pas épuisés

---

## 🔑 **VÉRIFICATION API KEY**

### **Permissions de l'API Key :**
1. Menu → **"APIs & Services"** → **"Credentials"**
2. Cliquer sur votre API key
3. Dans **"API restrictions"** :
   - ☑️ Maps JavaScript API
   - ☑️ Geocoding API
   - ☑️ Places API

### **Restrictions de domaine :**
1. Dans **"Application restrictions"** :
   - **HTTP referrers** : Ajouter `localhost:*` et votre domaine Vercel
   - Ou **"None"** pour les tests

---

## 🧪 **TESTS APRÈS ACTIVATION**

Une fois toutes les APIs activées :

### **Test 1 : Rechargement**
```bash
# Dans l'application
1. Rafraîchir la page (Cmd/Ctrl + R)
2. Essayer de créer un nouveau job
3. Cliquer sur le sélecteur de localisation
```

### **Test 2 : Fonctionnalités**
- ✅ La carte se charge sans erreur
- ✅ L'autocomplete d'adresse fonctionne
- ✅ Le click sur la carte place un marqueur
- ✅ "Use My Location" fonctionne
- ✅ L'adresse s'affiche correctement

### **Test 3 : Console**
Vérifier que les erreurs suivantes ont disparu :
- ❌ `GEOCODER_GEOCODE: REQUEST_DENIED`
- ❌ `This API project is not authorized`
- ❌ `You're calling a legacy API`

---

## 🚨 **SI LES ERREURS PERSISTENT**

### **Délai d'activation :**
- Les APIs peuvent prendre **5-15 minutes** à s'activer complètement
- Attendre et réessayer

### **Cache du navigateur :**
```bash
# Vider le cache
Cmd/Ctrl + Shift + R (hard refresh)
# Ou
F12 → Network → "Disable cache" (cochée) → rafraîchir
```

### **Vérification des logs :**
1. Google Cloud Console → **"Logging"** → **"Logs Explorer"**
2. Filtrer par "Maps API" pour voir les erreurs détaillées

---

## ✅ **CONFIRMATION FINALE**

Quand tout fonctionne :
- 🗺️ Carte Google Maps sans erreurs
- 📍 Géocodage fonctionnel (adresses affichées)
- 🔍 Autocomplete d'adresse opérationnel
- 📱 Géolocalisation utilisateur active
- ✨ Interface fluide et rapide

**Une fois ces étapes complétées, ton Job Tracker aura une intégration Google Maps parfaitement fonctionnelle !** 🎉
