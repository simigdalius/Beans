// =====================================================================
// auth.js — Εγγραφή (Sign up), Σύνδεση (Log in) και έλεγχος συνδεδεμένου χρήστη
// ---------------------------------------------------------------------
// Endpoints που περιέχει:
//   POST /auth/register  → δημιουργία νέου λογαριασμού
//   POST /auth/login     → σύνδεση με username ή email
//   GET  /auth/me        → στοιχεία του συνδεδεμένου χρήστη
//
// Επίσης εξάγει το requireAuth: έναν "φύλακα" που μπαίνει σε όποιο endpoint
// πρέπει να το βλέπουν μόνο συνδεδεμένοι χρήστες.
//
// Πώς δουλεύει η σύνδεση (JWT):
//   1. Ο χρήστης κάνει login → το backend του δίνει ένα token (μεγάλο κείμενο).
//   2. Το κινητό αποθηκεύει το token.
//   3. Σε κάθε επόμενο αίτημα το στέλνει στο header:
//        Authorization: Bearer <token>
//   4. Το backend ελέγχει το token και ξέρει ποιος χρήστης είναι.
// =====================================================================

const express = require('express');
const bcrypt = require('bcryptjs');               // hashing κωδικών
const jwt = require('jsonwebtoken');              // δημιουργία/έλεγχος tokens σύνδεσης
const rateLimit = require('express-rate-limit');  // όριο προσπαθειών (κατά του brute force)
const { db } = require('./db');                   // η σύνδεση με τη βάση beans.db

// Ο router είναι μια "μικρή εφαρμογή" με δικά της routes.
// Το server.js τη συνδέει κάτω από το /auth.
const router = express.Router();

// Το μυστικό κλειδί για τα tokens (από το .env) και πόσο ισχύει κάθε token
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_LIFETIME = '7d'; // ο χρήστης μένει συνδεδεμένος 7 μέρες

// "Ψεύτικο" hash που χρησιμοποιείται όταν ο χρήστης ΔΕΝ υπάρχει.
// Έτσι το login κάνει τον ίδιο χρόνο είτε υπάρχει ο λογαριασμός είτε όχι,
// και κάποιος δεν μπορεί να μαντέψει ποια usernames υπάρχουν μετρώντας τον χρόνο.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

// Βοηθητική συνάρτηση: φτιάχνει token που περιέχει το id και το username του χρήστη.
// Το token είναι υπογεγραμμένο με το JWT_SECRET, άρα δεν μπορεί να πλαστογραφηθεί.
function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_LIFETIME,
  });
}

// Όριο: μέγιστο 10 προσπάθειες ανά 15 λεπτά από την ίδια IP.
// Προστατεύει από επιθέσεις brute force (δοκιμή χιλιάδων κωδικών).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 λεπτά σε milliseconds
  limit: 10,
  message: { error: 'Too many attempts. Please try again later.' },
});

// ---------------------------------------------------------------------
// POST /auth/register — Εγγραφή νέου χρήστη
// Το κινητό στέλνει: { "username": "...", "email": "...", "password": "..." }
// Επιστρέφει:        { "token": "...", "user": { "id": 1, "username": "..." } }
// ---------------------------------------------------------------------
router.post('/register', authLimiter, async (req, res) => {
  // Παίρνουμε τα δεδομένα από το σώμα (body) του αιτήματος.
  // Το "?? {}" αποτρέπει σφάλμα αν δεν σταλεί καθόλου body.
  const { username, email, password } = req.body ?? {};

  // --- Έλεγχος δεδομένων (ΠΟΤΕ δεν εμπιστευόμαστε ό,τι στέλνει το κινητό) ---

  // Username: 3-20 χαρακτήρες, μόνο λατινικά γράμματα, αριθμοί, _ και .
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_.]{3,20}$/.test(username)) {
    return res.status(400).json({
      error: 'Username must be 3-20 characters: letters, numbers, _ or .',
    });
  }
  // Email: απλός έλεγχος μορφής κάτι@κάτι.κάτι
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email.' });
  }
  // Κωδικός: 8-72 χαρακτήρες (το bcrypt χρησιμοποιεί μόνο τους πρώτους 72)
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 8-72 characters.' });
  }

  // Υπάρχει ήδη χρήστης με αυτό το username ή email;
  // Τα "?" γεμίζουν με ασφάλεια από τις τιμές → προστασία από SQL injection.
  const exists = db
    .prepare('SELECT 1 FROM users WHERE username = ? OR email = ?')
    .get(username, email);
  if (exists) {
    return res.status(409).json({ error: 'Username or email is already taken.' });
  }

  // Hash του κωδικού. Ο αριθμός 10 είναι πόσο "βαρύ" είναι το hashing:
  // αρκετά αργό ώστε να δυσκολεύει τις επιθέσεις, αρκετά γρήγορο για τον χρήστη.
  const passwordHash = await bcrypt.hash(password, 10);

  // Αποθήκευση του νέου χρήστη (το email αποθηκεύεται πάντα με πεζά)
  const result = db
    .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
    .run(username, email.toLowerCase(), passwordHash);

  // Ο χρήστης συνδέεται αμέσως μετά την εγγραφή: του δίνουμε token.
  // 201 = "δημιουργήθηκε"
  const user = { id: result.lastInsertRowid, username };
  res.status(201).json({ token: createToken(user), user });
});

// ---------------------------------------------------------------------
// POST /auth/login — Σύνδεση
// Το κινητό στέλνει: { "login": "username ή email", "password": "..." }
// Επιστρέφει:        { "token": "...", "user": { "id", "username", "theme" } }
// ---------------------------------------------------------------------
router.post('/login', authLimiter, async (req, res) => {
  const { login, password } = req.body ?? {};
  if (typeof login !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Please enter your username/email and password.' });
  }

  // Ψάχνουμε τον χρήστη είτε με username είτε με email
  const user = db
    .prepare('SELECT id, username, password_hash, theme FROM users WHERE username = ? OR email = ?')
    .get(login, login);

  // Σύγκριση κωδικού με το αποθηκευμένο hash.
  // Αν ο χρήστης δεν υπάρχει, συγκρίνουμε με το DUMMY_HASH (βλ. εξήγηση πιο πάνω).
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) {
    // Ίδιο μήνυμα και στις δύο περιπτώσεις: δεν αποκαλύπτουμε αν υπάρχει ο λογαριασμός.
    // 401 = "μη εξουσιοδοτημένος"
    return res.status(401).json({ error: 'Invalid login credentials.' });
  }

  // Επιτυχία: επιστρέφουμε token και βασικά στοιχεία (μαζί με το theme για το UI)
  res.json({
    token: createToken(user),
    user: { id: user.id, username: user.username, theme: user.theme },
  });
});

// ---------------------------------------------------------------------
// requireAuth — "Φύλακας" (middleware) για προστατευμένα endpoints
// ---------------------------------------------------------------------
// Χρήση σε άλλα αρχεία:
//   const { requireAuth } = require('./auth');
//   router.get('/κάτι', requireAuth, (req, res) => {
//     // εδώ το req.user.id είναι το id του συνδεδεμένου χρήστη
//   });
//
// Αν δεν υπάρχει έγκυρο token, σταματά το αίτημα με 401
// και ο κώδικας του endpoint δεν τρέχει ποτέ.
function requireAuth(req, res, next) {
  // Το header έχει τη μορφή "Bearer <token>". Κρατάμε μόνο το token.
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'You need to log in.' });

  try {
    // Ελέγχει την υπογραφή και τη λήξη του token.
    // Αν είναι έγκυρο, επιστρέφει τα δεδομένα που βάλαμε μέσα: { id, username }
    req.user = jwt.verify(token, JWT_SECRET);
    next(); // όλα καλά → συνέχεια στο endpoint
  } catch {
    res.status(401).json({ error: 'Your session has expired or is invalid.' });
  }
}

// ---------------------------------------------------------------------
// GET /auth/me — Ποιος είμαι;
// Χρειάζεται header: Authorization: Bearer <token>
// Το frontend το καλεί όταν ανοίγει η εφαρμογή, για να δει αν το
// αποθηκευμένο token ισχύει ακόμα (αλλιώς δείχνει την οθόνη login).
// ---------------------------------------------------------------------
router.get('/me', requireAuth, (req, res) => {
  // ΠΟΤΕ δεν επιστρέφουμε το password_hash στο κινητό
  const user = db
    .prepare('SELECT id, username, email, theme, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
});

// Εξάγουμε τον router (για το server.js) και τον φύλακα (για τα άλλα αρχεία)
module.exports = { router, requireAuth };
