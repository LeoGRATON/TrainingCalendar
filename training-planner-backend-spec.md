# Training Planner — Spécification back-end (v0)

## Stack recommandée

| Couche          | Choix                                              |
| --------------- | -------------------------------------------------- |
| Framework       | Symfony avec api-plateform                         |
| Base de données | PostgreSQL                                         |
| Auth            | JWT (access token) + Refresh token httpOnly cookie |
| ORM             | Doctrine (Symfony)                                 |

---

## Modèle de données

### Table `users`

```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,       -- bcrypt hash
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table `sessions`

```sql
CREATE TABLE sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day         VARCHAR(3) NOT NULL CHECK (day IN ('lun','mar','mer','jeu','ven','sam','dim')),
  discipline  VARCHAR(10) NOT NULL CHECK (discipline IN ('swim','bike','run','gym','rest')),
  description TEXT,
  position    INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

> `position` permet de gérer l'ordre des séances dans un même jour (drag-and-drop prévu plus tard).

---

## API REST

### Auth

| Méthode | Route            | Body                  | Description                             |
| ------- | ---------------- | --------------------- | --------------------------------------- |
| POST    | `/auth/register` | `{ email, password }` | Crée un compte                          |
| POST    | `/auth/login`    | `{ email, password }` | Retourne un JWT + set le refresh cookie |
| POST    | `/auth/refresh`  | —                     | Renouvelle l'access token via le cookie |
| POST    | `/auth/logout`   | —                     | Invalide le refresh cookie              |

### Sessions

Toutes ces routes nécessitent un `Authorization: Bearer <token>` valide.
Le `user_id` est **toujours lu depuis le JWT**, jamais accepté dans le body.

| Méthode | Route           | Body                                       | Description                                              |
| ------- | --------------- | ------------------------------------------ | -------------------------------------------------------- |
| GET     | `/sessions`     | —                                          | Retourne les séances du user connecté, groupées par jour |
| POST    | `/sessions`     | `{ day, discipline, description? }`        | Crée une séance                                          |
| PATCH   | `/sessions/:id` | `{ discipline?, description?, position? }` | Modifie une séance                                       |
| DELETE  | `/sessions/:id` | —                                          | Supprime une séance                                      |

### Format de réponse GET `/sessions`

```json
{
  "lun": [
    { "id": 1, "discipline": "run", "description": "45min Z2", "position": 0 }
  ],
  "mar": [],
  "mer": [
    {
      "id": 2,
      "discipline": "swim",
      "description": "10x100m pull",
      "position": 0
    },
    {
      "id": 3,
      "discipline": "gym",
      "description": "Gainage + PPG",
      "position": 1
    }
  ],
  "jeu": [],
  "ven": [],
  "sam": [
    {
      "id": 4,
      "discipline": "bike",
      "description": "Sortie longue 3h Z2",
      "position": 0
    }
  ],
  "dim": [
    {
      "id": 5,
      "discipline": "run",
      "description": "Run de récup 30min",
      "position": 0
    }
  ]
}
```

---

## Auth — détail JWT

```
Access token  → durée de vie : 15 min, transmis dans le header Authorization
Refresh token → durée de vie : 30 jours, stocké en cookie httpOnly / SameSite=Strict
```

- Le refresh token n'est **jamais** renvoyé dans le body de la réponse
- Le `user_id` est encodé dans le payload du JWT
- Côté front, stocker l'access token en mémoire (pas localStorage) pour éviter les attaques XSS

---

## Validation

| Champ         | Règle                                                    |
| ------------- | -------------------------------------------------------- |
| `email`       | format valide, unique en base                            |
| `password`    | min 8 caractères, hashé en bcrypt (cost 12)              |
| `day`         | enum stricte : `lun / mar / mer / jeu / ven / sam / dim` |
| `discipline`  | enum stricte : `swim / bike / run / gym / rest`          |
| `description` | optionnel, max 500 caractères                            |
| `position`    | entier >= 0                                              |

Toutes les erreurs de validation retournent un `400` avec un message clair.
Un accès à une session qui n'appartient pas au user connecté retourne un `403`.

---

## Mise en place plus tard (v1+)

- Navigation multi-semaines (ajout d'un champ `week` ou `date` sur les sessions)
- Endpoint `PATCH /sessions/reorder` pour le drag-and-drop
- Statistiques : volume par discipline, charge hebdomadaire
- Import GPX / Strava
- Notifications / rappels
