🔗 Communication avec le backend

Le frontend consomme l’API REST disponible sur :

http://localhost:3000


Les images sont chargées depuis :

http://localhost:3000/assets/pokemons/


---

# 📕 README — Backend (API Pokédex)

```md
# Pokédex – Backend API

API REST développée avec Express et MongoDB permettant de gérer une base de données de Pokémon.

## 🚀 Lancer le serveur

### Prérequis
- Node.js
- MongoDB (local ou distant)
- Une configuration MongoDB valide (`connect.js`)

### Installation
```bash
npm install

Démarrage
npm start


Le serveur démarre sur :

http://localhost:3000

📚 Documentation API

Une documentation Swagger est disponible à l’adresse :

http://localhost:3000/api-docs

📦 Endpoints disponibles
🔹 Récupérer tous les Pokémon
GET /pokemons


Retourne la liste complète des Pokémon.

🔹 Pagination (20 Pokémon par page)
GET /pokemons/20?page=1


Paramètres

page (optionnel) : numéro de la page

Réponse

{
  "page": 1,
  "limit": 20,
  "count": 20,
  "data": [ ... ]
}

🔹 Recherche par nom (toutes langues)
GET /pokemons/search?name=Bulb


Recherche dans :

name.french

name.english

name.japanese

name.chinese

🔹 Détail d’un Pokémon par ID
GET /pokemons/:id


Exemple :

GET /pokemons/1


Retourne un Pokémon ou 404 s’il n’existe pas.

🔹 Créer un Pokémon
POST /pokemons


Body JSON

{
  "id": 25,
  "name": {
    "french": "Pikachu",
    "english": "Pikachu",
    "japanese": "ピカチュウ",
    "chinese": "皮卡丘"
  },
  "type": ["Electric"],
  "base": {
    "HP": 35,
    "Attack": 55,
    "Defense": 40,
    "SpecialAttack": 50,
    "SpecialDefense": 50,
    "Speed": 90
  },
  "image": "http://localhost:3000/assets/pokemons/25.png"
}

🔹 Mettre à jour un Pokémon
PUT /pokemons/:id


Permet de modifier :

les noms

les types

les statistiques

l’image

🔹 Supprimer un Pokémon
DELETE /pokemons/:id


Réponse

{
  "message": "Pokemon deleted successfully",
  "id": 1
}

🖼️ Images

Les images sont servies statiquement via :

/assets


Exemple :

http://localhost:3000/assets/pokemons/1.png

Lien vers la vidéo de démonstration : https://youtu.be/okPJsPj0UrE