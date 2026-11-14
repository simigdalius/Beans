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
  console.log('New random JWT_SECRET was created in .env');
}

// --- 2. Φόρτωση βιβλιοθηκών και δικών μας αρχείων ---
// ΠΡΟΣΟΧΗ: πρέπει να γίνεται ΜΕΤΑ το βήμα 1, γιατί το auth.js διαβάζει
// το JWT_SECRET τη στιγμή που φορτώνεται.
const express = require('express'); // βιβλιοθήκη για web servers / APIs
const auth = require('./auth');      // το δικό μας αρχείο για Sign up / Log in

// Δημιουργία της εφαρμογής (του server)
const app = express();

const { getTodayQuestion } = require('./db'); //import apo db.js
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

app.get('/api/daily-question', (req, res) => {
  const question = getTodayQuestion();

  // Βρίσκουμε την τωρινή ώρα σε μορφή "HH:MM" (π.χ. "14:30")
  const currentTime = new Date().toLocaleTimeString('el-GR', {
    timeZone: 'Europe/Athens',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  if (currentTime < question.drop_time) {
    return res.json({
      status: "waiting",
      drop_time: question.drop_time,
      message: "Question hasn't yet been released"
    });
  }

  return res.json({
    status: "ready",
    ...question
  });
});
app.post('/api/daily-answer', (req, res) => { //ουσιαστικα διαβαζει drop_time,φτιαχνει endTime που εινΙ 5 λεπτα μετα το drop
  const question = getTodayQuestion();
  
  // 1. Βρίσκουμε την τωρινή ώρα
  const currentTime = new Date().toLocaleTimeString('el-GR', {
    timeZone: 'Europe/Athens',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // 2. Υπολογίζουμε την ώρα λήξης (drop_time + 5 λεπτά)
  const [dropHour, dropMinute] = question.drop_time.split(':').map(Number);
  const totalMinutes = dropHour * 60 + dropMinute + 5; // Προσθέτουμε 5 λεπτά
  
  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;
  
  // Μετατροπή ξανά σε μορφή "HH:MM" (π.χ. 15:47)
  const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

  // 3. ΕΛΕΓΧΟΙ
  if (currentTime < question.drop_time) {
    return res.status(403).json({ error: "Question hasn't yet been released" });
  }

  if (currentTime > endTime) {
    return res.status(403).json({ error: "Time is up! You have 5 minutes to answer" });
  }

  // 4. Αποθήκευση της απάντησης
  const { answer } = req.body; 
  if (!answer) {
    return res.status(400).json({ error: "No answer was recorded" });
  }

  // εδω θα μπουν οι εντολες για να αποθηκευτει στη βαση η απαντηση
  // π.χ. db.prepare('INSERT INTO answers (user_id, question_id, text) VALUES (?, ?, ?)').run(...)

  return res.json({ message: "Your answer was saved succesfully" });
});
// Αν το αίτημα δεν ταίριαξε με κανένα route παραπάνω → 404 (δεν βρέθηκε)
// ΠΡΟΣΟΧΗ: πρέπει να μένει μετά από όλα τα routes.
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Χειρισμός απρόβλεπτων σφαλμάτων (bug στον κώδικα κ.λπ.).
// Το σφάλμα γράφεται στο τερματικό για εμάς, αλλά στον χρήστη στέλνουμε
// γενικό μήνυμα, ώστε να μη φαίνονται εσωτερικές λεπτομέρειες (ασφάλεια).
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// --- 4. Εκκίνηση ---
// Η θύρα (port) διαβάζεται από το .env. Αν δεν υπάρχει, χρησιμοποιείται η 3000.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Beans backend: http://localhost:${PORT}`));
