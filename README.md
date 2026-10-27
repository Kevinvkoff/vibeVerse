# VibeVerse

VibeVerse est une application de découverte et de partage musical : interface React/Vite, API Laravel et base PostgreSQL.

## Prérequis

- Node.js 20.19+ ou 22.12+
- PHP 8.2+ et Composer
- PostgreSQL 15+

## Démarrage

1. Crée une base PostgreSQL nommée `vibeverse`.
2. Dans `backend`, copie `.env.example` vers `.env`, complète `DB_USERNAME` et `DB_PASSWORD`, puis exécute :

   ```powershell
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```

3. Dans un autre terminal, lance le frontend :

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Ouvre l’adresse Vite affichée dans le terminal. Les appels `/api` sont redirigés vers Laravel sur `127.0.0.1:8000`.

## API

- `GET /api/tracks` — titres paginés
- `GET /api/tracks?search=indie` — recherche par titre ou artiste
- `GET /api/tracks/{id}` — détail d’un titre
- `GET /api/playlists` — playlists publiques

## Fonctionnalités frontend

- Recherche dans le catalogue, filtres par genre et affichage des playlists.
- Lecture réelle des fichiers audio sélectionnés depuis l’appareil, avec pause, piste suivante/précédente, aléatoire, répétition, volume et navigation dans le morceau.
- Import audio stocké dans IndexedDB du navigateur et restauré après actualisation.
- Playlists et titres favoris sauvegardés dans le navigateur.
- Raccourcis : `Espace` lecture/pause, `←` / `→` piste précédente/suivante, `Ctrl+K` ou `⌘K` recherche.

Les morceaux du catalogue de démonstration n’ont pas de fichier audio associé. Utilise « Importer ma musique » pour écouter des fichiers audio locaux. Les imports restent sur l’appareil et ne sont ni téléversés sur le serveur ni partagés avec d’autres utilisateurs. L’authentification, le téléversement serveur et le partage public des playlists nécessitent encore un backend dédié.
