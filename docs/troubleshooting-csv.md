# Troubleshooting - Erreurs de Chargement CSV

## Problèmes Courants

### 1. "Erreur lors du chargement des événements"
### 2. "Erreur lors du chargement de l'équipe"
### 3. "Impossible de charger les produits"

## Diagnostic Étape par Étape

### Étape 1 : Vérifier les Variables d'Environnement

Vérifiez que toutes les variables sont définies dans Vercel :

**Frontend (VITE_*):**
```bash
VITE_SHEET_PRODUCTS_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Products
VITE_GOOGLE_SHEET_TEAM_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Team
VITE_GOOGLE_SHEET_EVENTS_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Events
VITE_SHEET_STANDINGS_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Standings
```

**Backend:**
```bash
PRODUCTS_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Products
```

### Étape 2 : Vérifier la Console du Navigateur

Ouvrez la console (F12) et regardez les erreurs détaillées :

- **HTTP 404** → URL incorrecte ou sheet non publié
- **HTTP 403** → Permissions insuffisantes (sheet non public)
- **HTTP 500** → Problème côté Google Sheets
- **"Réponse vide"** → Sheet vide ou format invalide
- **CORS error** → Sheet non publié correctement

### Étape 3 : Vérifier la Publication Google Sheets

Pour chaque sheet (Products, Team, Events, Standings) :

1. Ouvrez le Google Sheet
2. **File → Share → Publish to web**
3. Sélectionnez le bon onglet (sheet)
4. Format : **Comma-separated values (.csv)**
5. Cliquez **Publish**
6. Copiez l'URL générée

**Format d'URL attendu :**
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet={SHEET_NAME}
```

### Étape 4 : Tester l'URL Directement

Ouvrez l'URL CSV dans votre navigateur :

✅ **Succès** : Vous voyez le CSV brut (texte avec virgules)
❌ **Échec** : Page d'erreur ou redirection

**Exemple de CSV valide :**
```
id,name,type,price_eur,image1,...
maillot-domicile,Maillot Domicile,maillot,55.00,https://...
```

### Étape 5 : Vérifier le Format CSV

Le CSV doit avoir :
- **En-tête** sur la première ligne
- **Données** à partir de la ligne 2
- **Délimiteur** : virgule (`,`) ou point-virgule (`;`)
- **Encodage** : UTF-8

**Format attendu pour Products (11 colonnes) :**
```
id, name, type, price_eur, image1, image2, image3, image4, size_guide_url, active, soldout
```

**Format attendu pour Team :**
```
numero, prenom, nom, poste, photo_url, origine, fun_fact, joueur_prefere, matchs_joues, buts, passes_decisives
```

**Format attendu pour Events :**
```
date, title, start_time, end_time, location, type, team_home, team_away, score_home, score_away, resultat, home_logo, away_logo
```

### Étape 6 : Vérifier les Permissions

Le sheet doit être :
- ✅ **Public** (Anyone with the link can view)
- ✅ **Publié en CSV** (File → Share → Publish to web)
- ❌ **Pas privé** (sinon erreur 403)

### Étape 7 : Vérifier le Cache

Les URLs incluent un paramètre `_ts` pour éviter le cache, mais si le problème persiste :

1. Videz le cache du navigateur (Ctrl+Shift+Del)
2. Redéployez sur Vercel pour forcer le rebuild
3. Vérifiez que les variables d'environnement sont bien chargées

## Solutions Rapides

### Problème : HTTP 404
**Solution :** Vérifiez que l'URL contient bien le bon `SPREADSHEET_ID` et `SHEET_NAME`

### Problème : HTTP 403
**Solution :** Republiez le sheet en CSV (File → Share → Publish to web)

### Problème : Réponse vide
**Solution :** Vérifiez que le sheet contient des données (au moins l'en-tête + 1 ligne)

### Problème : Format invalide
**Solution :** Vérifiez que le nombre de colonnes correspond au format attendu

### Problème : Variables non chargées
**Solution :** 
1. Vérifiez dans Vercel Dashboard → Settings → Environment Variables
2. Redéployez après avoir ajouté/modifié des variables
3. Les variables `VITE_*` doivent être dans **Production**, **Preview** et **Development**

## Test Local

Pour tester localement :

1. Créez un fichier `.env.local` :
```env
VITE_SHEET_PRODUCTS_CSV_URL=https://...
VITE_GOOGLE_SHEET_TEAM_CSV_URL=https://...
VITE_GOOGLE_SHEET_EVENTS_CSV_URL=https://...
```

2. Redémarrez le serveur de dev :
```bash
npm run dev
```

3. Vérifiez la console pour les erreurs détaillées

## Messages d'Erreur Améliorés

Les messages d'erreur incluent maintenant :
- Le code HTTP (404, 403, 500, etc.)
- Le statut de la réponse
- Des indications sur la configuration

Exemple : `"Impossible de charger les produits. HTTP 404: Not Found"`

## Support

Si le problème persiste :
1. Vérifiez les logs Vercel (Deployments → Functions → Logs)
2. Vérifiez la console du navigateur (F12)
3. Testez l'URL CSV directement dans le navigateur
4. Vérifiez que le sheet est bien publié et accessible publiquement

