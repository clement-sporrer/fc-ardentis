# Guide de Configuration Google Apps Script

## 🚀 Installation Rapide

### Étape 1 : Ouvrir l'Éditeur Apps Script

1. Ouvrez votre Google Sheet "FC Ardentis Data"
2. Cliquez sur **Extensions → Apps Script**
3. Supprimez le code par défaut

### Étape 2 : Copier le Nouveau Code

1. Ouvrez [`docs/data-sources.md`](docs/data-sources.md)
2. Trouvez la section "Apps Script Setup" → "Web App Configuration"
3. Copiez **tout le code JavaScript** (depuis `const ADMIN_EMAIL` jusqu'à la fin de `testEmailFunctionality()`)
4. Collez-le dans l'éditeur Apps Script

### Étape 3 : Configurer les Constantes

**TRÈS IMPORTANT** - Modifiez ces deux lignes en haut du script :

```javascript
const ADMIN_EMAIL = 'votre-email@example.com'; // ← Votre email
const APP_TOKEN = 'votre-token-secret-ici';    // ← Un token secret aléatoire
```

**Exemple de token :** `fc-ardentis-2026-secret-xyz789`

⚠️ **Le `APP_TOKEN` doit correspondre exactement à `SHEET_APP_TOKEN` dans vos variables d'environnement !**

### Étape 4 : Tester le Système (ESSENTIEL)

Le nouveau code inclut **6 fonctions de test** pour vérifier que tout fonctionne parfaitement.

#### Test Rapide : Design des Emails

1. Dans le menu déroulant des fonctions, sélectionnez **`testEmailLayout`**
2. Cliquez sur le bouton **Exécuter** (▶️)
3. Si c'est la première fois :
   - Cliquez sur "Examiner les autorisations"
   - Sélectionnez votre compte Google
   - Cliquez sur "Paramètres avancés"
   - Cliquez sur "Accéder à [nom du projet] (non sécurisé)"
   - Cliquez sur "Autoriser"
4. Attendez l'exécution (quelques secondes)
5. Vérifiez les logs : **View → Logs** ou **Ctrl+Enter**
6. Vérifiez votre boîte email (à l'adresse `ADMIN_EMAIL`)

**Vous devriez recevoir 2 emails avec le design premium :**
- ✅ Email de confirmation client (design ultra-premium)
- 🛒 Email de notification admin (avec tous les détails)

#### Test Complet : Flux de Bout en Bout

Pour tester le flux complet (création → paiement → emails) :

1. Sélectionnez **`testCompleteFlow`**
2. Cliquez sur **Exécuter** (▶️)
3. Vérifiez les logs
4. Vérifiez votre boîte email - vous devriez recevoir **3 emails** :
   - Confirmation de commande client
   - Notification admin nouvelle commande
   - Confirmation de paiement client

#### Nettoyage

Après les tests, nettoyez les données de test :

1. Sélectionnez **`cleanupTestOrders`**
2. Cliquez sur **Exécuter** (▶️)
3. Tous les ordres de test seront supprimés du Google Sheet

#### Fonctions de Test Disponibles

| Fonction | Description | Modifie le Sheet ? |
|----------|-------------|-------------------|
| `testEmailLayout` | Teste uniquement le design des emails | ❌ Non |
| `testCreateOrder` | Teste la création de commande | ✅ Oui |
| `testUpdateStatus` | Teste la mise à jour du statut | ✅ Oui |
| `testPaymentEmail` | Teste l'email de paiement seul | ❌ Non |
| `testCompleteFlow` | Teste le flux complet | ✅ Oui |
| `cleanupTestOrders` | Supprime les commandes de test | ✅ Oui |

**Résultat attendu dans les logs :**
```
═══════════════════════════════════════════
🎨 TEST: Premium Email Design
═══════════════════════════════════════════
📧 Sending test emails to: votre-email@example.com
📦 Test Order ID: TEST-abc12345

✅ Customer confirmation email sent
✅ Admin notification email sent

✨ Test complete! Check your inbox at: votre-email@example.com
═══════════════════════════════════════════
```

**Si vous voyez des erreurs :**
- `Cannot read properties of undefined (reading 'postData')` → C'est normal si vous essayez d'exécuter `doPost` directement. Utilisez les fonctions de test à la place.
- Erreur d'autorisation → Réessayez l'étape 3 ci-dessus
- Erreur d'envoi d'email → Vérifiez que `ADMIN_EMAIL` est correct

### Étape 5 : Admirer le Design Premium 🎨

Ouvrez les emails que vous avez reçus et admirez :
- 🎨 **Header avec dégradé** Deep Navy
- 🏆 **Logo FC Ardentis** centré
- 📊 **Tableaux élégants** avec les articles
- 💜 **Couleurs de la marque** (Violet, Navy, Magenta)
- 📱 **Design responsive** (parfait sur mobile)
- ✨ **Animations subtiles** et effets premium

### Étape 6 : Déployer

1. Cliquez sur **Deploy → Manage deployments**
2. Si c'est votre premier déploiement :
   - Cliquez sur **"New deployment"**
   - Cliquez sur l'icône d'engrenage ⚙️ → Sélectionnez **"Web app"**
   - Description : "FC Ardentis Order Handler v2"
   - Execute as : **Me**
   - Who has access : **Anyone**
   - Cliquez sur **Deploy**
3. Si vous avez déjà un déploiement :
   - Cliquez sur l'icône de crayon ✏️ à côté du déploiement actif
   - Sélectionnez **"New version"**
   - Cliquez sur **Deploy**
4. Copiez l'URL du Web App (elle ressemble à `https://script.google.com/macros/s/.../exec`)

### Étape 6 : Configurer les Variables d'Environnement

Dans votre fichier `.env.local` (et sur Vercel) :

```env
SHEET_ORDERS_WEBAPP_URL=https://script.google.com/macros/s/.../exec
SHEET_APP_TOKEN=votre-token-secret-ici
```

⚠️ **Le `SHEET_APP_TOKEN` DOIT être identique au `APP_TOKEN` dans votre script !**

### Étape 7 : Tester avec une Vraie Commande (Optionnel)

1. Allez sur votre site web
2. Ajoutez un article au panier
3. Passez une commande de test
4. Vérifiez :
   - ✅ La commande apparaît dans le Google Sheet
   - ✅ Vous recevez un email de notification admin
   - ✅ Le client reçoit un email de confirmation
   - ✅ Après paiement Stripe, le statut passe à "paid"
   - ✅ Le client reçoit un email de confirmation de paiement

## 🔧 Dépannage

### "Cannot read properties of undefined (reading 'postData')"

**Cause :** Vous essayez d'exécuter `doPost` directement dans l'éditeur.

**Solution :** Utilisez la fonction `testEmailFunctionality` pour tester, ou appelez le script via HTTP POST depuis votre API.

### Les emails ne sont pas envoyés

1. Vérifiez que `ADMIN_EMAIL` est correct
2. Exécutez `testEmailFunctionality` et vérifiez les logs
3. Vérifiez vos dossiers spam
4. Assurez-vous que le compte Google a l'autorisation d'envoyer des emails

### "Unauthorized" dans les logs Vercel

**Cause :** Le `SHEET_APP_TOKEN` ne correspond pas au `APP_TOKEN`.

**Solution :** 
1. Vérifiez la valeur de `APP_TOKEN` dans votre Apps Script
2. Vérifiez la valeur de `SHEET_APP_TOKEN` dans `.env.local` et sur Vercel
3. Assurez-vous qu'elles sont **exactement identiques**

### Les commandes n'apparaissent pas dans le Sheet

1. Vérifiez les logs Apps Script : **Extensions → Apps Script → Executions**
2. Vérifiez les logs Vercel de votre fonction `/api/checkout`
3. Exécutez le script de réconciliation :
   ```bash
   node --env-file=.env.local -r ts-node/register scripts/reconcile-orders.ts
   ```

## 📋 Checklist de Vérification

### Configuration
- [ ] `ADMIN_EMAIL` configuré dans Apps Script
- [ ] `APP_TOKEN` configuré dans Apps Script
- [ ] `SITE_URL` configuré dans Apps Script (pour le logo)

### Tests Premium
- [ ] `testEmailLayout` exécuté avec succès ✨
- [ ] Emails premium reçus et design validé 🎨
- [ ] `testCompleteFlow` exécuté avec succès 🚀
- [ ] Les 3 types d'emails reçus (confirmation, admin, paiement)
- [ ] `cleanupTestOrders` exécuté pour nettoyer 🧹

### Déploiement
- [ ] Script déployé en tant que Web App
- [ ] URL du Web App copiée
- [ ] `SHEET_ORDERS_WEBAPP_URL` configuré dans `.env.local`
- [ ] `SHEET_APP_TOKEN` configuré dans `.env.local`
- [ ] `SHEET_APP_TOKEN` correspond exactement à `APP_TOKEN`
- [ ] Variables d'environnement déployées sur Vercel

### Validation Finale (Optionnel)
- [ ] Commande réelle de test passée avec succès
- [ ] Emails reçus pour la commande réelle
- [ ] Design premium validé sur mobile 📱

## 🎯 Fonctionnalités Activées

Après cette configuration, votre système aura :

### 🎨 Design Premium
✨ **Emails Ultra-Premium** avec les couleurs FC Ardentis (Deep Navy, Soft Violet)  
🏆 **Logo du club** dans chaque email  
📱 **Design responsive** parfait sur mobile et desktop  
🎯 **3 types d'emails** avec designs distincts et adaptés

### 🔧 Fonctionnalités Techniques
✅ **Emails automatiques** aux clients (confirmation de commande + confirmation de paiement)  
✅ **Notifications admin** pour chaque nouvelle commande  
✅ **Prévention des doublons** (vérifie les order_id existants)  
✅ **Sécurité renforcée** (authentification par token)  
✅ **Gestion d'erreurs** (logs détaillés pour le débogage)  
✅ **Support de récupération** (accepte les order_id pré-spécifiés)

### 🧪 Suite de Tests Complète
🧪 **6 fonctions de test** pour valider chaque aspect  
🚀 **Test end-to-end** du flux complet  
🧹 **Nettoyage automatique** des données de test  
📊 **Logs détaillés** avec emojis pour faciliter le débogage

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez [`docs/data-sources.md`](docs/data-sources.md) section "Troubleshooting"
2. Vérifiez les logs Apps Script (View → Logs)
3. Vérifiez les logs Vercel
4. Exécutez le script de réconciliation pour identifier les commandes manquantes
