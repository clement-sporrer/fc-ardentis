# 🚀 Quick Start - Système Premium

## En 5 Minutes ⏱️

### 1️⃣ Copier le Code (2 min)
1. Ouvrez [`docs/data-sources.md`](docs/data-sources.md)
2. Trouvez la section "Web App Configuration"
3. Copiez **TOUT** le code JavaScript
4. Collez dans Google Apps Script (Extensions → Apps Script)

### 2️⃣ Configurer (1 min)
Modifiez ces 3 lignes en haut du script :
```javascript
const ADMIN_EMAIL = 'fcardentis@gmail.com';  // ← Votre email
const APP_TOKEN = 'votre-token-secret-123';  // ← Créez un token
const SITE_URL = 'https://fc-ardentis.vercel.app';
```

### 3️⃣ Tester (1 min)
1. Sélectionnez `testEmailLayout` dans le menu déroulant
2. Cliquez sur Exécuter (▶️)
3. Autorisez si demandé
4. Vérifiez vos emails ! 📧

### 4️⃣ Valider (30 sec)
1. Sélectionnez `testCompleteFlow`
2. Cliquez sur Exécuter (▶️)
3. Vérifiez que vous recevez 3 emails

### 5️⃣ Nettoyer (30 sec)
1. Sélectionnez `cleanupTestOrders`
2. Cliquez sur Exécuter (▶️)
3. Les données de test sont supprimées

---

## ✅ C'est Prêt !

Déployez maintenant :
- Deploy → Manage deployments → Edit → New version

---

## 🎨 Ce Que Vous Obtenez

### Emails Ultra-Premium
- ✨ Design avec les couleurs du club
- 🏆 Logo FC Ardentis
- 📱 Responsive (mobile + desktop)
- 💜 Dégradés élégants

### 3 Types d'Emails
1. **Confirmation Client** - Récapitulatif complet
2. **Notification Admin** - Infos pour traiter la commande
3. **Paiement Confirmé** - Message de félicitations

### Tests Automatisés
- 🧪 6 fonctions de test
- 🚀 Test end-to-end complet
- 🧹 Nettoyage automatique

---

## 📚 Documentation Complète

- **Guide d'installation** : [`APPS_SCRIPT_SETUP.md`](APPS_SCRIPT_SETUP.md)
- **Fonctionnalités** : [`PREMIUM_FEATURES.md`](PREMIUM_FEATURES.md)
- **Résumé** : [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md)

---

## 🆘 Problème ?

### Les emails n'arrivent pas
- Vérifiez vos spams
- Vérifiez que `ADMIN_EMAIL` est correct
- Autorisez l'envoi d'emails dans Apps Script

### Erreur "postData undefined"
- Normal ! Utilisez les fonctions de test
- Ne lancez pas `doPost` directement

### Erreur d'autorisation
- Cliquez sur "Paramètres avancés"
- Puis "Accéder au projet (non sécurisé)"
- Autorisez l'envoi d'emails

---

**🎉 Profitez de votre système premium ! 🎉**
