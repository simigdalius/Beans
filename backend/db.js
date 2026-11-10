// =====================================================================
// db.js — Σύνδεση με τις βάσεις δεδομένων του Beans
// ---------------------------------------------------------------------
// Το Beans έχει ΔΥΟ βάσεις SQLite (κάθε βάση είναι ένα αρχείο στον φάκελο):
//   beans.db      → χρήστες, φίλοι, απαντήσεις      (δομή: schema.sql)
//   questions.db  → οι ερωτήσεις της εφαρμογής      (δομή + 120 ερωτήσεις: questions.sql)
//
// Αν τα αρχεία .db δεν υπάρχουν, δημιουργούνται αυτόματα την πρώτη φορά
// που ξεκινά ο server.
//
// Χρήση σε οποιοδήποτε άλλο αρχείο του backend:
//   const { db, questionsDb, getTodayQuestion } = require('./db');
// =====================================================================

const Database = require('better-sqlite3'); // βιβλιοθήκη για SQLite
const fs = require('fs');                   // ανάγνωση αρχείων (για τα .sql)
const path = require('path');               // σωστή δημιουργία διαδρομών αρχείων

// ---------------------------------------------------------------------
// open — Ανοίγει (ή δημιουργεί) μια βάση και τρέχει το αντίστοιχο .sql αρχείο
//   file    : το όνομα του αρχείου της βάσης (π.χ. 'beans.db')
//   sqlFile : το αρχείο με τις εντολές που φτιάχνουν τους πίνακες
// ---------------------------------------------------------------------
function open(file, sqlFile) {
  // __dirname = ο φάκελος όπου βρίσκεται αυτό το αρχείο (backend/)
  const conn = new Database(path.join(__dirname, file));

  // WAL: επιτρέπει πολλές αναγνώσεις ταυτόχρονα με μία εγγραφή → πιο γρήγορο
  conn.pragma('journal_mode = WAL');

  // Ενεργοποιεί τους κανόνες REFERENCES / ON DELETE CASCADE των πινάκων.
  // Στο SQLite είναι ΚΛΕΙΣΤΟΙ από προεπιλογή!
  conn.pragma('foreign_keys = ON');

  // Τρέχει το .sql αρχείο. Είναι ασφαλές να τρέχει σε κάθε εκκίνηση, γιατί:
  //   CREATE TABLE IF NOT EXISTS → δεν ξαναφτιάχνει πίνακες που υπάρχουν
  //   INSERT OR IGNORE           → δεν ξαναβάζει ερωτήσεις που υπάρχουν
  conn.exec(fs.readFileSync(path.join(__dirname, sqlFile), 'utf8'));
  return conn;
}

// Άνοιγμα των δύο βάσεων
const db = open('beans.db', 'schema.sql');                 // χρήστες, φίλοι, απαντήσεις
const questionsDb = open('questions.db', 'questions.sql'); // ερωτήσεις

// ---------------------------------------------------------------------
// getTodayQuestion — Επιστρέφει την ερώτηση της ημέρας
// ---------------------------------------------------------------------
// - Αν έχει ήδη επιλεγεί ερώτηση για σήμερα → επιστρέφει την ίδια
//   (έτσι όλοι οι χρήστες βλέπουν την ίδια ερώτηση όλη τη μέρα).
// - Αλλιώς διαλέγει τυχαία μία που δεν έχει ξαναβγεί και τη "σημαδεύει"
//   με τη σημερινή ημερομηνία στη στήλη used_on.
//
// Επιστρέφει αντικείμενο: { id, text, category, used_on }
// ---------------------------------------------------------------------
function getTodayQuestion() {
  // Σημερινή ημερομηνία σε μορφή 'YYYY-MM-DD' (π.χ. '2026-11-08')
  // ΣΗΜΕΙΩΣΗ: toISOString δίνει ώρα UTC (2 ώρες πίσω από την Ελλάδα).
  const today = new Date().toISOString().slice(0, 10);

  // 1. Υπάρχει ήδη ερώτηση για σήμερα;
  let q = questionsDb.prepare('SELECT * FROM questions WHERE used_on = ?').get(today);
  if (q) return q;

  // 2. Αν όχι, διάλεξε τυχαία μία που δεν έχει χρησιμοποιηθεί (used_on IS NULL)
  q = questionsDb
    .prepare('SELECT * FROM questions WHERE used_on IS NULL ORDER BY RANDOM() LIMIT 1')
    .get();

  // Αν δεν βρέθηκε καμία, έχουν χρησιμοποιηθεί όλες
  if (!q) throw new Error('Τελείωσαν οι ερωτήσεις! Προσθέστε νέες στο questions.sql');

  // 3. Σημείωσε ότι αυτή είναι η σημερινή ερώτηση και επελεξε τυχαια την ωρα
  const dropTime = getRandomDropTime(); 
  questionsDb.prepare('UPDATE questions SET used_on = ?, drop_time = ? WHERE id = ?').run(today, dropTime, q.id);
  
  return { ...q, used_on: today, drop_time: dropTime };
}

function getRandomDropTime() { //paragetai tyxaia wra apo 11 ews 00
  const hour = Math.floor(Math.random() * (23 - 11)) + 11; // 11 έως 22
  const minute = Math.floor(Math.random() * 60);           // 0 έως 59
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Εξάγουμε τις βάσεις και τη συνάρτηση για να τις χρησιμοποιούν τα άλλα αρχεία
module.exports = { db, questionsDb, getTodayQuestion };
