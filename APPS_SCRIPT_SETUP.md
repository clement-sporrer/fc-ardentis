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

### Étape 4 : Tester les Emails (Recommandé)

1. Dans le menu déroulant des fonctions, sélectionnez **`testEmailFunctionality`**
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

**Résultat attendu dans les logs :**
```
Sending test emails...
Test Order ID: test-abc12345
✓ Customer email sent successfully
✓ Admin notification sent successfully
Test complete! Check your inbox at: votre-email@example.com
```

**Si vous voyez des erreurs :**
- `Cannot read properties of undefined (reading 'postData')` → C'est normal si vous essayez d'exécuter `doPost` directement. Utilisez `testEmailFunctionality` à la place.
- Erreur d'autorisation → Réessayez l'étape 3 ci-dessus
- Erreur d'envoi d'email → Vérifiez que `ADMIN_EMAIL` est correct

### Étape 5 : Déployer

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

### Étape 7 : Tester avec une Vraie Commande

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

- [ ] `ADMIN_EMAIL` configuré dans Apps Script
- [ ] `APP_TOKEN` configuré dans Apps Script
- [ ] `testEmailFunctionality` exécuté avec succès
- [ ] Emails de test reçus
- [ ] Script déployé en tant que Web App
- [ ] URL du Web App copiée
- [ ] `SHEET_ORDERS_WEBAPP_URL` configuré dans `.env.local`
- [ ] `SHEET_APP_TOKEN` configuré dans `.env.local`
- [ ] `SHEET_APP_TOKEN` correspond exactement à `APP_TOKEN`
- [ ] Variables d'environnement déployées sur Vercel
- [ ] Commande de test passée avec succès
- [ ] Emails reçus pour la commande de test

## 🎯 Fonctionnalités Activées

Après cette configuration, votre système aura :

✅ **Emails automatiques** aux clients (confirmation de commande + confirmation de paiement)  
✅ **Notifications admin** pour chaque nouvelle commande  
✅ **Prévention des doublons** (vérifie les order_id existants)  
✅ **Sécurité renforcée** (authentification par token)  
✅ **Gestion d'erreurs** (logs détaillés pour le débogage)  
✅ **Support de récupération** (accepte les order_id pré-spécifiés)

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez [`docs/data-sources.md`](docs/data-sources.md) section "Troubleshooting"
2. Vérifiez les logs Apps Script (View → Logs)
3. Vérifiez les logs Vercel
4. Exécutez le script de réconciliation pour identifier les commandes manquantes
