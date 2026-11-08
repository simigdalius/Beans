// =====================================================================
// server.js — Το σημείο εκκίνησης του backend του Beans
// ---------------------------------------------------------------------
// Τι κάνει:
//   1. Διαβάζει τις ρυθμίσεις (.env) και φτιάχνει μυστικό κλειδί αν χρειάζεται
//   2. Δημιουργεί τον web server με τη βιβλιοθήκη Express
//   3. Συνδέει τα "routes", δηλαδή ποιο αρχείο απαντά σε ποιο URL
//   4. Ξεκινά να "ακούει" για αιτήματα από το κινητό (frontend)
//
// Εκκίνηση:
//   npm run dev   → για ανάπτυξη (κάνει αυτόματα restart όταν αλλάζει ο κώδικας)
//   npm start     → κανονική εκκίνηση
//
// Για να προσθέσετε νέα λειτουργία (π.χ. φίλους):
//   φτιάξτε νέο αρχείο (π.χ. friends.js) με router και συνδέστε το εδώ
//   με app.use('/friends', ...), όπως γίνεται με το auth παρακάτω.
// =====================================================================

// --- 1. Ρυθμίσεις (.env) και μυστικό κλειδί ---
// Το JWT_SECRET είναι το "μυστικό κλειδί" με το οποίο υπογράφονται τα tokens σύνδεσης.
// Αν κάποιος το μάθει, μπορεί να φτιάξει ψεύτικα tokens και να μπει σε όποιον
// λογαριασμό θέλει. Γι' αυτό κάθε υπολογιστής πρέπει να έχει το ΔΙΚΟ του, τυχαίο.
//
// Τι κάνει ο κώδικας παρακάτω:
//   1. Διαβάζει το αρχείο .env (αν υπάρχει)
//   2. Αν το JWT_SECRET λείπει ή είναι ακόμα το κείμενο-δείγμα του .env.example,
//      φτιάχνει αυτόματα ένα τυχαίο και το γράφει στο .env.
// Έτσι αρκούν οι εντολές του README και δεν χρειάζεται να το φτιάξει κανείς με το χέρι.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_PATH = path.join(__dirname, '.env');

// 1. Φόρτωση του .env: οι τιμές του μπαίνουν στο process.env
if (fs.existsSync(ENV_PATH)) process.loadEnvFile(ENV_PATH);

// 2. Έλεγχος του μυστικού: λείπει, είναι πολύ μικρό ή είναι το δείγμα;
const secret = process.env.JWT_SECRET || '';
if (secret.length < 32 || secret.includes('βάλτε')) {
  // 32 τυχαία bytes → 64 χαρακτήρες hex (πρακτικά αδύνατον να μαντευτούν)
  const newSecret = crypto.randomBytes(32).toString('hex');

  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  if (/^JWT_SECRET=.*$/m.test(content)) {
    // Υπάρχει γραμμή JWT_SECRET → αντικαθιστούμε μόνο αυτή
    content = content.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${newSecret}`);
  } else {
    // Δεν υπάρχει → την προσθέτουμε στο τέλος
    content += `${content && !content.endsWith('\n') ? '\n' : ''}JWT_SECRET=${newSecret}\n`;
  }
  fs.writeFileSync(ENV_PATH, content);

  process.env.JWT_SECRET = newSecret;
  console.log('Δημιουργήθηκε νέο τυχαίο JWT_SECRET στο .env');
}

// --- 2. Φόρτωση βιβλιοθηκών και δικών μας αρχείων ---
// ΠΡΟΣΟΧΗ: πρέπει να γίνεται ΜΕΤΑ το βήμα 1, γιατί το auth.js διαβάζει
// το JWT_SECRET τη στιγμή που φορτώνεται.
const express = require('express'); // βιβλιοθήκη για web servers / APIs
const auth = require('./auth');      // το δικό μας αρχείο για Sign up / Log in

// Δημιουργία της εφαρμογής (του server)
const app = express();

// Middleware: τρέχει πριν από κάθε αίτημα.
// Μετατρέπει το JSON που στέλνει το κινητό σε αντικείμενο JavaScript (req.body).
// Το όριο 10kb αποτρέπει κάποιον να στείλει τεράστια δεδομένα για να "ρίξει" τον server.
app.use(express.json({ limit: '10kb' }));

// --- 3. Routes (ποιο URL κάνει τι) ---

// GET /  → απλός έλεγχος ότι ο server τρέχει (ανοίξτε http://localhost:3000)
app.get('/', (req, res) => res.json({ app: 'Beans', status: 'ok' }));

// Όλα τα URL που ξεκινούν με /auth τα χειρίζεται το auth.js
// π.χ. POST /auth/register, POST /auth/login, GET /auth/me
app.use('/auth', auth.router);

// Αν το αίτημα δεν ταίριαξε με κανένα route παραπάνω → 404 (δεν βρέθηκε)
// ΠΡΟΣΟΧΗ: πρέπει να μένει μετά από όλα τα routes.
app.use((req, res) => res.status(404).json({ error: 'Δεν βρέθηκε.' }));

// Χειρισμός απρόβλεπτων σφαλμάτων (bug στον κώδικα κ.λπ.).
// Το σφάλμα γράφεται στο τερματικό για εμάς, αλλά στον χρήστη στέλνουμε
// γενικό μήνυμα, ώστε να μη φαίνονται εσωτερικές λεπτομέρειες (ασφάλεια).
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Κάτι πήγε στραβά.' });
});

// --- 4. Εκκίνηση ---
// Η θύρα (port) διαβάζεται από το .env. Αν δεν υπάρχει, χρησιμοποιείται η 3000.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Beans backend: http://localhost:${PORT}`));
