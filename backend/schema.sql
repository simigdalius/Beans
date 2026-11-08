-- =====================================================================
-- schema.sql — Οι πίνακες της βασικής βάσης beans.db
-- ---------------------------------------------------------------------
-- Περιέχει:
--   users        → οι λογαριασμοί των χρηστών
--   friendships  → αιτήματα φιλίας και φίλοι
--   answers      → οι απαντήσεις στις ερωτήσεις (και τα Memories)
--
-- Οι ερωτήσεις βρίσκονται σε ξεχωριστή βάση: questions.db (βλ. questions.sql)
--
-- Το αρχείο τρέχει αυτόματα από το db.js σε κάθε εκκίνηση του server.
-- Λόγω του "IF NOT EXISTS" δεν πειράζει πίνακες που υπάρχουν ήδη.
-- ΠΡΟΣΟΧΗ: αν αλλάξετε έναν πίνακα που ΥΠΑΡΧΕΙ ήδη, η αλλαγή δεν εφαρμόζεται
-- αυτόματα. Σβήστε το beans.db (χάνονται τα δοκιμαστικά δεδομένα) για να
-- ξαναφτιαχτεί από την αρχή.
--
-- Λεξικό:
--   PRIMARY KEY       → το μοναδικό "αναγνωριστικό" κάθε γραμμής
--   AUTOINCREMENT     → το id αυξάνεται αυτόματα (1, 2, 3...)
--   NOT NULL          → το πεδίο είναι υποχρεωτικό
--   UNIQUE            → δεν επιτρέπονται διπλές τιμές
--   DEFAULT           → τιμή που μπαίνει αν δεν δοθεί άλλη
--   CHECK (...)       → κανόνας που πρέπει να ισχύει, αλλιώς η εγγραφή απορρίπτεται
--   REFERENCES        → η τιμή πρέπει να υπάρχει σε άλλον πίνακα
--   ON DELETE CASCADE → αν σβηστεί ο χρήστης, σβήνονται αυτόματα και αυτές οι γραμμές
-- =====================================================================


-- ---------------------------------------------------------------------
-- users — Χρήστες (Sign up / Log in, theme, push notification)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,  -- NOCASE: "Maria" = "maria"
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,                  -- bcrypt hash, ΠΟΤΕ ο κωδικός σε plain text
  theme         TEXT NOT NULL DEFAULT 'light',  -- Customize theme
  push_token    TEXT,                           -- "διεύθυνση" του κινητού για τα push notifications
                                                -- (κενό αν ο χρήστης δεν έδωσε άδεια)
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))  -- πότε φτιάχτηκε ο λογαριασμός (UTC)
);


-- ---------------------------------------------------------------------
-- friendships — Φίλοι (Search new friends)
-- Κάθε γραμμή είναι ένα αίτημα φιλίας από τον requester προς τον addressee.
--   status = 'pending'  → το αίτημα στάλθηκε, περιμένει απάντηση
--   status = 'accepted' → είναι φίλοι
-- Αν το αίτημα απορριφθεί, η γραμμή απλώς σβήνεται.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS friendships (
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- ποιος έστειλε το αίτημα
  addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- ποιος το έλαβε
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (requester_id, addressee_id),  -- όχι δεύτερο ίδιο αίτημα
  CHECK (requester_id <> addressee_id)       -- όχι φιλία με τον εαυτό σου
);


-- ---------------------------------------------------------------------
-- answers — Απαντήσεις στην ερώτηση της ημέρας
-- Τα Memories στο profile είναι απλώς οι απαντήσεις ενός χρήστη:
--   SELECT * FROM answers WHERE user_id = ? ORDER BY created_at DESC;
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- ποιος απάντησε
  question_id INTEGER NOT NULL,                  -- id ερώτησης από το questions.db
                                                 -- (άλλη βάση, γι' αυτό δεν έχει REFERENCES:
                                                 --  τον έλεγχο τον κάνει ο κώδικας)
  text        TEXT NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 500),  -- 1-500 χαρακτήρες,
                                                 -- όχι μόνο κενά
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),  -- πότε απάντησε (UTC)
  UNIQUE (user_id, question_id)                  -- μία απάντηση ανά χρήστη ανά ερώτηση
);
