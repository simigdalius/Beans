-- =====================================================================
-- questions.sql — Η βάση ερωτήσεων questions.db
-- ---------------------------------------------------------------------
-- Περιέχει τον πίνακα questions και 120 ερωτήσεις στα αγγλικά,
-- χωρισμένες σε 9 κατηγορίες.
--
-- Το αρχείο τρέχει αυτόματα από το db.js σε κάθε εκκίνηση του server.
-- Αν το questions.db δεν υπάρχει, δημιουργείται από εδώ.
--
-- Για να προσθέσετε νέα ερώτηση:
--   προσθέστε μια γραμμή ('Your question?', 'category'), στη λίστα παρακάτω
--   (προσοχή: κόμμα στο τέλος κάθε γραμμής, ερωτηματικό ; μόνο στην τελευταία)
--   και κάντε restart τον server. Το "OR IGNORE" προσπερνά όσες υπάρχουν ήδη.
--   Μην αλλάζετε το κείμενο υπαρχουσών ερωτήσεων: θα μπει ως ΝΕΑ ερώτηση.
-- =====================================================================

CREATE TABLE IF NOT EXISTS questions (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  text     TEXT NOT NULL UNIQUE,      -- το κείμενο της ερώτησης (όχι διπλές)
  category TEXT NOT NULL,             -- κατηγορία, π.χ. 'fun', 'deep', 'food'
  used_on  TEXT UNIQUE                -- η μέρα που βγήκε ('YYYY-MM-DD').
                                      -- NULL = δεν έχει βγει ακόμα.
                                      -- UNIQUE: μία ερώτηση τη μέρα, δεν επαναλαμβάνεται
);

INSERT OR IGNORE INTO questions (text, category) VALUES
-- ---------- daily ----------
('What made you smile today?', 'daily'),
('What was the best part of your day so far?', 'daily'),
('What are you doing right now?', 'daily'),
('What did you have for breakfast today?', 'daily'),
('What is one thing you are looking forward to this week?', 'daily'),
('What is the last thing you laughed at?', 'daily'),
('Describe your day in three words.', 'daily'),
('What is the most annoying thing that happened to you today?', 'daily'),
('What is something new you learned today?', 'daily'),
('Who was the last person you texted?', 'daily'),
('What is the weather like where you are?', 'daily'),
('How many hours did you sleep last night?', 'daily'),
('What is on your to-do list for tomorrow?', 'daily'),
('What is the last photo you took on your phone?', 'daily'),
('What song is stuck in your head right now?', 'daily'),

-- ---------- fun ----------
('If you could have any superpower, what would it be?', 'fun'),
('If you were an animal, which one would you be?', 'fun'),
('What would you do with a million euros?', 'fun'),
('If you could live in any fictional world, which would you choose?', 'fun'),
('What is the weirdest food combination you secretly love?', 'fun'),
('If you could swap lives with someone for a day, who would it be?', 'fun'),
('What is your go-to karaoke song?', 'fun'),
('What would your superhero name be?', 'fun'),
('If your life were a movie, what would its title be?', 'fun'),
('What is the most useless talent you have?', 'fun'),
('If you could instantly master one skill, what would it be?', 'fun'),
('What is the strangest dream you remember?', 'fun'),
('If you could only eat one food forever, what would it be?', 'fun'),
('Which emoji describes you best?', 'fun'),
('What app would you delete if you could only keep three?', 'fun'),
('If you opened a café, what would you call it?', 'fun'),
('What is the funniest thing a friend has ever said to you?', 'fun'),
('If you could talk to animals, which one would you talk to first?', 'fun'),
('What would you name a pet dragon?', 'fun'),
('What is your most-used word or phrase?', 'fun'),

-- ---------- would you rather ----------
('Would you rather be able to fly or be invisible?', 'would-you-rather'),
('Would you rather live by the sea or in the mountains?', 'would-you-rather'),
('Would you rather travel to the past or the future?', 'would-you-rather'),
('Would you rather never use social media again or never watch a movie again?', 'would-you-rather'),
('Would you rather have more time or more money?', 'would-you-rather'),
('Would you rather be a famous singer or a famous athlete?', 'would-you-rather'),
('Would you rather give up coffee or give up chocolate?', 'would-you-rather'),
('Would you rather always be 10 minutes late or 20 minutes early?', 'would-you-rather'),
('Would you rather live without music or without movies?', 'would-you-rather'),
('Would you rather read minds or see the future?', 'would-you-rather'),
('Would you rather have a rewind button or a pause button for your life?', 'would-you-rather'),
('Would you rather explore space or the deep ocean?', 'would-you-rather'),
('Would you rather be the funniest or the smartest person in the room?', 'would-you-rather'),
('Would you rather live in a big city or a small village?', 'would-you-rather'),
('Would you rather speak every language or play every instrument?', 'would-you-rather'),

-- ---------- deep ----------
('What is something you are grateful for today?', 'deep'),
('What advice would you give your younger self?', 'deep'),
('What is a goal you want to achieve this year?', 'deep'),
('What makes you feel most like yourself?', 'deep'),
('What is a fear you would like to overcome?', 'deep'),
('Who has influenced you the most in your life?', 'deep'),
('What does a perfect day look like for you?', 'deep'),
('What is something you changed your mind about recently?', 'deep'),
('What are you most proud of?', 'deep'),
('What is a small thing that makes you really happy?', 'deep'),
('Where do you see yourself in five years?', 'deep'),
('What is the best compliment you have ever received?', 'deep'),
('What is a habit you want to start?', 'deep'),
('What is a lesson you learned the hard way?', 'deep'),
('What does friendship mean to you?', 'deep'),
('When do you feel the most relaxed?', 'deep'),
('What is something you wish more people knew about you?', 'deep'),
('What would you do if you knew you could not fail?', 'deep'),
('What is one thing you would like to be remembered for?', 'deep'),
('What is the kindest thing someone has done for you?', 'deep'),

-- ---------- food ----------
('What is your comfort food?', 'food'),
('What is the best meal you have ever had?', 'food'),
('Sweet or savory?', 'food'),
('What dish can you cook better than anyone you know?', 'food'),
('Pineapple on pizza: yes or no?', 'food'),
('What food would you never try again?', 'food'),
('What is your favorite late-night snack?', 'food'),
('Coffee, tea or neither?', 'food'),
('What cuisine would you like to try next?', 'food'),
('What is your favorite dessert?', 'food'),

-- ---------- travel ----------
('If you could travel anywhere tomorrow, where would you go?', 'travel'),
('What is the most beautiful place you have ever visited?', 'travel'),
('Beach holiday or city break?', 'travel'),
('What is a country you dream of visiting?', 'travel'),
('What is your best travel memory?', 'travel'),
('Window seat or aisle seat?', 'travel'),
('What is the one thing you always pack?', 'travel'),
('Would you rather go on a road trip or take a long train journey?', 'travel'),
('What city would you love to live in for a year?', 'travel'),
('What is the strangest thing that happened to you on a trip?', 'travel'),

-- ---------- music & entertainment ----------
('What song have you been listening to on repeat?', 'entertainment'),
('What is the best concert you have been to?', 'entertainment'),
('What show are you watching right now?', 'entertainment'),
('What movie could you watch a hundred times?', 'entertainment'),
('What book would you recommend to everyone?', 'entertainment'),
('Which artist would you love to see live?', 'entertainment'),
('What is your favorite song from your childhood?', 'entertainment'),
('What is a movie that made you cry?', 'entertainment'),
('What game are you playing lately?', 'entertainment'),
('What podcast or YouTube channel do you recommend?', 'entertainment'),

-- ---------- memories ----------
('What is your favorite childhood memory?', 'memories'),
('What was your favorite toy as a kid?', 'memories'),
('What did you want to be when you grew up?', 'memories'),
('What is the best birthday you have ever had?', 'memories'),
('What is a moment you wish you could relive?', 'memories'),
('What is the most spontaneous thing you have ever done?', 'memories'),
('What is the best gift you have ever received?', 'memories'),
('What is your favorite memory with your friends?', 'memories'),
('What was your favorite subject at school?', 'memories'),
('What is the most embarrassing thing that happened to you at school?', 'memories'),

-- ---------- friends ----------
('Which friend would you take to a desert island?', 'friends'),
('Who in your friend group is most likely to become famous?', 'friends'),
('What is the best advice a friend has given you?', 'friends'),
('Who was the last friend who made you laugh out loud?', 'friends'),
('What is the perfect night out with friends?', 'friends'),
('Which friend do you call when something goes wrong?', 'friends'),
('What inside joke still makes you laugh?', 'friends'),
('What is a tradition you have with your friends?', 'friends'),
('Who would survive the longest in a zombie apocalypse in your group?', 'friends'),
('What is one thing you appreciate about your best friend?', 'friends');
