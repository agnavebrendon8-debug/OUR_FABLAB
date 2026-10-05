// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Autorise le serveur à lire le JSON envoyé par le fetch JavaScript
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

// Connexion à la base de données
const db = new sqlite3.Database('./fablab.db', (err) => {
    if (err) console.error("Erreur BDD :", err.message);
    else console.log("Connecté à la base de données du FabLab.");
});

// Création de la table
db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)`);

// Route pour gérer l'inscription
app.post('/inscription', async (req, res) => {
    // Le JavaScript n'envoie plus le champ "verification", car il l'a déjà validé chez le client !
    const { email, password } = req.body;

    // Sécurité au cas où l'utilisateur contourne le JavaScript
    if (!email || !password) {
        return res.status(400).json({ message: "Champs manquants." });
    }

    // Vérification de l'existence de l'utilisateur
    const sqlCheck = `SELECT * FROM utilisateurs WHERE email = ?`;
    
    db.get(sqlCheck, [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la recherche en BDD." });
        }

        if (row) {
            // L'utilisateur existe déjà -> Statut 400 (Bad Request)
            return res.status(400).json({ message: "Cette adresse email est déjà inscrite." });
        } else {
            try {
                // Hachage du mot de passe
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insertion
                const sqlInsert = `INSERT INTO utilisateurs (email, password) VALUES (?, ?)`;
                db.run(sqlInsert, [email, hashedPassword], function(err) {
                    if (err) {
                        return res.status(500).json({ message: "Erreur lors de l'enregistrement." });
                    }
                    // Inscription réussie -> Statut 200 (OK)
                    return res.status(200).json({ message: "Inscription validée avec succès !" });
                });

            } catch (error) {
                return res.status(500).json({ message: "Erreur de chiffrement du mot de passe." });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Serveur FabLab démarré sur http://localhost:${PORT}`);
});
