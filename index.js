import express from "express";
import pokemon from "./schema/pokemon.js";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import cors from "cors";

import "./connect.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/assets", express.static("assets"));

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pokemon API",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./index.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("http://localhost:3000/api-docs");
});
/**
 * @swagger
 * /pokemons:
 *   get:
 *     tags:
 *       - Pokemons
 *     summary: Récupérer tous les Pokémon
 *     responses:
 *       200:
 *         description: Liste de tous les Pokémon
 *         content:
 *           application/json:
 *             examples:
 *               pokemons:
 *                 value:
 *                   [
 *                     {
 *                       "id": 1,
 *                       "name": { "french": "Bulbizarre" },
 *                       "type": ["Grass", "Poison"],
 *                       "base": {
 *                         "HP": 45,
 *                         "Attack": 49,
 *                         "Defense": 49,
 *                         "SpecialAttack": 65,
 *                         "SpecialDefense": 65,
 *                         "Speed": 45
 *                       },
 *                       "image": "http://localhost:3000/assets/pokemons/1.png"
 *                     }
 *                   ]
 *       500:
 *         description: Erreur serveur
 */
app.get("/pokemons", async (req, res) => {
  try {
    const pokemons = await pokemon.find({});
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /pokemons/20:
 *   get:
 *     tags:
 *       - Pokemons
 *     summary: Récupérer les Pokémon par pages de 20
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numéro de la page (20 Pokémon par page)
 *     responses:
 *       200:
 *         description: Liste paginée de Pokémon (20 par page)
 *         content:
 *           application/json:
 *             examples:
 *               pokemons:
 *                 value:
 *                   {
 *                     "page": 1,
 *                     "limit": 20,
 *                     "count": 20,
 *                     "data": [
 *                       {
 *                         "id": 1,
 *                         "name": { "french": "Bulbizarre" },
 *                         "type": ["Grass", "Poison"],
 *                         "image": "http://localhost:3000/assets/pokemons/1.png"
 *                       }
 *                     ]
 *                   }
 *       500:
 *         description: Erreur serveur
 */
app.get("/pokemons/20", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const pokemons = await pokemon.find({}).skip(skip).limit(limit);

    res.json({
      page,
      limit,
      count: pokemons.length,
      data: pokemons,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /pokemons/search:
 *   get:
 *     tags:
 *       - Pokemons
 *     summary: Rechercher des Pokémon par nom (toutes langues)
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: Bulbizarre
 *         description: Nom (ou partie du nom) à rechercher, dans english/french/japanese/chinese
 *     responses:
 *       200:
 *         description: Liste des Pokémon correspondants
 *         content:
 *           application/json:
 *             examples:
 *               results:
 *                 value:
 *                   [
 *                     {
 *                       "id": 1,
 *                       "name": { "french": "Bulbizarre", "english": "Bulbasaur" },
 *                       "type": ["Grass", "Poison"],
 *                       "image": "http://localhost:3000/assets/pokemons/1.png"
 *                     }
 *                   ]
 *       400:
 *         description: Paramètre name manquant
 *       500:
 *         description: Erreur serveur
 */
app.get("/pokemons/search", async (req, res) => {
  try {
    const q = (req.query.name || "").trim();
    if (!q) {
      return res.status(400).json({ error: "Query param 'name' is required" });
    }

    const regex = new RegExp(q, "i");

    const results = await pokemon.find({
      $or: [
        { "name.english": regex },
        { "name.french": regex },
        { "name.japanese": regex },
        { "name.chinese": regex },
      ],
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /pokemons:
 *   post:
 *     tags:
 *       - Pokemons
 *     summary: Créer un Pokémon
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             pokemon:
 *               summary: Exemple de Pokémon
 *               value:
 *                 id: 5
 *                 name:
 *                   english: Charmeleon
 *                   japanese: リザード
 *                   chinese: 火恐龙
 *                   french: Reptincel
 *                 type:
 *                   - Fire
 *                 base:
 *                   HP: 58
 *                   Attack: 64
 *                   Defense: 58
 *                   SpecialAttack: 80
 *                   SpecialDefense: 65
 *                   Speed: 80
 *                 image: http://localhost:3000/assets/pokemons/5.png
 *     responses:
 *       201:
 *         description: Pokémon créé avec succès
 *         content:
 *           application/json:
 *             examples:
 *               created:
 *                 value:
 *                   id: 5
 *                   name:
 *                     french: Reptincel
 *                   type:
 *                     - Fire
 *                   base:
 *                     HP: 58
 *                     Attack: 64
 *                     Defense: 58
 *                     SpecialAttack: 80
 *                     SpecialDefense: 65
 *                     Speed: 80
 *                   image: http://localhost:3000/assets/pokemons/5.png
 *       400:
 *         description: Requête invalide
 */
app.post("/pokemons", async (req, res) => {
  try {
    const created = await pokemon.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /pokemons/{id}:
 *   get:
 *     tags:
 *       - Pokemons
 *     summary: Récupérer un Pokémon par son id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Identifiant du Pokémon
 *     responses:
 *       200:
 *         description: Détail du Pokémon
 *         content:
 *           application/json:
 *             examples:
 *               pokemon:
 *                 value:
 *                   {
 *                     "id": 1,
 *                     "name": { "french": "Bulbizarre" },
 *                     "type": ["Grass", "Poison"],
 *                     "base": {
 *                       "HP": 45,
 *                       "Attack": 49,
 *                       "Defense": 49,
 *                       "SpecialAttack": 65,
 *                       "SpecialDefense": 65,
 *                       "Speed": 45
 *                     },
 *                     "image": "http://localhost:3000/assets/pokemons/1.png"
 *                   }
 *       404:
 *         description: Pokémon non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.get("/pokemons/:id", async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);
    const poke = await pokemon.findOne({ id: pokeId });
    if (poke) {
      res.json(poke);
    } else {
      res.status(404).json({ error: "Pokemon not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /pokemons/{id}:
 *   put:
 *     tags:
 *       - Pokemons
 *     summary: Mettre à jour un Pokémon par son id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Identifiant du Pokémon à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             update:
 *               summary: Exemple de mise à jour
 *               value:
 *                 name:
 *                   english: Charmeleon
 *                   japanese: リザード
 *                   chinese: 火恐龙
 *                   french: Reptincel
 *                 type:
 *                   - Fire
 *                 base:
 *                   HP: 58
 *                   Attack: 64
 *                   Defense: 58
 *                   SpecialAttack: 80
 *                   SpecialDefense: 65
 *                   Speed: 80
 *                 image: http://localhost:3000/assets/pokemons/5.png
 *     responses:
 *       200:
 *         description: Pokémon mis à jour avec succès
 *       404:
 *         description: Pokémon non trouvé
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur serveur
 */
app.put("/pokemons/:id", async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);

    const updated = await pokemon.findOneAndUpdate({ id: pokeId }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Pokemon not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /pokemons/{id}:
 *   delete:
 *     tags:
 *       - Pokemons
 *     summary: Supprimer un Pokémon par son id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Identifiant du Pokémon à supprimer
 *     responses:
 *       200:
 *         description: Pokémon supprimé avec succès
 *         content:
 *           application/json:
 *             examples:
 *               success:
 *                 value:
 *                   {
 *                     "message": "Pokemon deleted successfully",
 *                     "id": 1
 *                   }
 *       404:
 *         description: Pokémon non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.delete("/pokemons/:id", async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);

    const deletedPokemon = await pokemon.findOneAndDelete({ id: pokeId });

    if (deletedPokemon) {
      res.json({
        message: "Pokemon deleted successfully",
        id: pokeId,
      });
    } else {
      res.status(404).json({ error: "Pokemon not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

console.log("Server is set up. Ready to start listening on a port.");

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
