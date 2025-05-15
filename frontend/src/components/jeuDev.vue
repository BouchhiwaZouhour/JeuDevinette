<template>
  <div class="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
    <div class="card shadow-lg" style="width: 100%; max-width: 500px;">
      <!-- Header -->
      <div class="card-header bg-primary text-white text-center">
        <h1 class="h3 mb-1">🎯 Jeu de Devinette</h1>
        <p class="mb-0">Trouvez le nombre entre 0 et 100</p>
      </div>

      <!-- Game Content -->
      <div class="card-body">
        <!-- Action Buttons -->
        <div class="d-flex gap-2 mb-4">
          <button @click="demarrerJeu" class="btn btn-success flex-grow-1 fw-bold" > Nouvelle Partie</button>
            
          <button @click="afficherScores"  class="btn btn-info text-white fw-bold"> Scores</button>
        </div>

        <!-- Game Area -->
        <div v-if="jeuEnCours" class="game-area">
          <!-- Attempt Counter -->
          <div class="d-flex justify-content-between align-items-center bg-info bg-opacity-10 rounded-pill px-3 py-2 mb-3">
            <span class="text-primary fw-medium">Tentative</span>
            <span class="badge bg-primary rounded-pill">{{ attempts }}/5</span>
          </div>
          <div v-if="jeuEnCours">
                ⏱ Temps écoulé : {{ compteur }} secondes
          </div>
          <!-- Input Field -->
          <div class="input-group mb-3">
            <input v-model.number="tentative" type="number"  min="0" max="100" placeholder="Entrez un nombre (0-100)" class="form-control form-control-lg"@keyup.enter="verifier" />
            <button  @click="verifier" class="btn btn-primary">Go</button>
          </div>

          <!-- Submit Button -->
          <button @click="verifier" class="btn btn-primary w-100 py-2 fw-bold">
            Vérifier
          </button>
        </div>

        <!-- Messages -->
        <div 
          v-if="message" 
          class="alert mt-4 text-center" 
          :class="{
            'alert-success': messageType === 'success',
            'alert-danger': messageType === 'error',
            'alert-info': messageType === 'info'
          }"
        >
          {{ message }}
        </div>


        <!-- Win Form -->
        <div v-if="gagne" class="mt-4 animate__animated animate__fadeIn">
          <div class="alert alert-warning text-center">
            <h3 class="alert-heading">🎉 Félicitations !</h3>
            <p class="mb-0">Votre score: <strong>{{ score }}/50</strong></p>
          </div>

          <div class="mb-3">
            <input v-model="nom" type="text" placeholder="Votre nom pour le tableau des scores" class="form-control form-control-lg"  />
          </div>
          <button 
            @click="enregistrerScore"
            class="btn btn-purple w-100 fw-bold text-white"
          >
            Enregistrer le score
          </button>
        </div>

        <!-- Game History -->
        <div v-if="historique.length > 0 && !afficherListeScores" class="mt-4">
          <h5 class="text-muted mb-2">Historique des tentatives:</h5>
          <ul class="list-group">
            <li 
              v-for="(item, index) in historique" 
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <span class="fw-medium">#{{ index + 1 }}: {{ item.guess }}</span>
              <span class="badge" :class="{
                'bg-success': item.result === 'plus grand',
                'bg-danger': item.result === 'plus petit'
              }">
                {{ item.result }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Scores List -->
        <div v-if="afficherListeScores" class="mt-4 animate__animated animate__fadeIn">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0 text-primary">Tableau des scores</h5>
            <button @click="afficherListeScores = false" class="btn btn-sm btn-outline-secondary">
              Fermer
            </button>
          </div>
          
          <div v-if="chargementScores" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          
          <div v-else>
            <div v-if="scores.length === 0" class="alert alert-info">
              Aucun score enregistré pour le moment.
            </div>
            
            <ul v-else class="list-group">
              <li 
                v-for="(score, index) in scores" 
                :key="score.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <span class="fw-bold">{{ index + 1 }}.</span>
                  <span class="ms-2">{{ score.name }}</span>
                </div>
                <span class="badge bg-primary rounded-pill">{{ score.score }}/50</span>
                <span class="badge bg-primary rounded-pill">{{ score.temps }}sec</span>

              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,onUnmounted  } from 'vue';
import axios from 'axios';
import 'animate.css';

// Réactives
const tentative = ref(null);
const message = ref('');
const messageType = ref('info');
const score = ref(null);
const nom = ref('');
const jeuEnCours = ref(false);
const gagne = ref(false);
const attempts = ref(0);
const historique = ref([]);
const afficherListeScores = ref(false);
const scores = ref([]);
const chargementScores = ref(false);

//timer
const compteur = ref(0);    
let intervalId = null; 

// Fonctions
const demarrerJeu = async () => {
  try {
    await axios.post('http://localhost:3000/api/game/start');
    message.value = 'Une nouvelle partie commence ! Devinez un nombre entre 0 et 100.';
    messageType.value = 'info';
    jeuEnCours.value = true;
    gagne.value = false;
    score.value = null;
    tentative.value = null;
    nom.value = '';
    attempts.value = 0;
    historique.value = [];
    afficherListeScores.value = false;
    compteur.value = 0; // compteur timer
    clearInterval(intervalId); 
   intervalId = setInterval(() => {
      compteur.value++;
   }, 1000);
  
  } catch (error) {
    message.value = 'Erreur lors du démarrage du jeu.';
    messageType.value = 'error';
  }
};

const verifier = async () => {
  if (tentative.value === null || tentative.value < 0 || tentative.value > 100) {
    message.value = 'Veuillez entrer un nombre entre 0 et 100';
    messageType.value = 'error';
    return;
  }
  
  try {
    attempts.value++;
    const res = await axios.post('http://localhost:3000/api/game/guess', { guess: tentative.value });
    
    historique.value.push({
      guess: tentative.value,
      result: res.data.message.toLowerCase()
    });

    message.value = res.data.message;
    
    if (res.data.result === 'gagne') {
      messageType.value = 'success';
      score.value = res.data.score;
      gagne.value = true;
      jeuEnCours.value = false;
    } else if (res.data.result === 'perdu') {
      messageType.value = 'error';
      jeuEnCours.value = false;
    } else {
      messageType.value = 'info';
    }
    if (res.data.result === 'gagne' || res.data.result === 'perdu') {
         clearInterval(intervalId); //arret timer
   }

    tentative.value = null;
  } catch (error) {
    message.value = 'Erreur serveur lors de la vérification.';
    messageType.value = 'error';
  }
};

const enregistrerScore = async () => {
  if (!nom.value || !score.value) {
    message.value = 'Veuillez entrer votre nom pour enregistrer le score';
    messageType.value = 'error';
    return;
  }
  
  try {
    await axios.post('http://localhost:3000/api/game/save-score', {
      name: nom.value,
      score: score.value,
      temps: compteur.value
    });
    message.value = `Score de ${nom.value} (${score.value}/50) enregistré !`;
    messageType.value = 'success';
    nom.value = '';
  } catch (error) {
    message.value = 'Erreur lors de l\'enregistrement du score.';
    messageType.value = 'error';
  }
};

const afficherScores = async () => {
  afficherListeScores.value = true;
  chargementScores.value = true;
  jeuEnCours.value = false;
  gagne.value = false;
  
  try {
    const response = await axios.get('http://localhost:3000/api/game/scores');
    scores.value = response.data;
  } catch (error) {
    message.value = 'Erreur lors du chargement des scores';
    messageType.value = 'error';
    scores.value = [];
  } finally {
    chargementScores.value = false;
  }
};

onMounted(() => {
});
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.btn-purple {
  background-color: #6f42c1;
  border-color: #6f42c1;
}

.btn-purple:hover {
  background-color: #5a32a3;
  border-color: #5a32a3;
}

.card {
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
}

.list-group-item {
  transition: all 0.2s;
}

.list-group-item:hover {
  transform: translateX(5px);
}
</style>