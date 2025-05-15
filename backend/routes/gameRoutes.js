import express from 'express';
import db from '../db.js'; 
const router = express.Router();

let randomNumber = null;
let attempts = 0;
//nv partie
router.post('/start', (req, res) => {
  randomNumber = Math.floor(Math.random() * 101);
  attempts = 0;
  console.log('Nombre genere :', randomNumber);
  res.json({ message: 'Nouvelle partie commencee !' });
});

//envoyer tentative
router.post('/guess', (req, res) => {
  const { guess } = req.body;

  if (randomNumber === null) {
    return res.status(400).json({ message: 'Le jeu n\'a pas encore demarre.' });
  }

  attempts++;

  if (attempts > 5) {
    return res.json({ result: 'perdu', message: `Desole, vous avez perdu. Le nombre etait ${randomNumber}.` });
  }

  if (guess < randomNumber) {
    return res.json({ result: 'continue', message: 'Plus grand' });
  } else if (guess > randomNumber) {
    return res.json({ result: 'continue', message: 'Plus petit' });
  } else {
    const score = (5 - attempts + 1) * 10;
    return res.json({ result: 'gagne', message: `Bravo ! Trouve en ${attempts} tentatives.`, score });
  }
});

//enregistrer score
router.post('/save-score', (req, res) => {
  const { name, score,temps  } = req.body;
  const sql = 'INSERT INTO scores (name, score,temps ) VALUES (?, ?, ?)';
   db.query(sql, [name, score,temps], (err, result) => {
    if (err) {
      console.error('Erreur insertion score :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json({ message: 'Score enregistré dans la base de données !' });
  });
});

// Récupérer la liste des scores
router.get('/scores', (req, res) => {
  const sql = 'SELECT * FROM scores ';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur récupération scores:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json(results);
  });
});
export default router;
