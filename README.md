# 🫘 Beans

Μια mobile εφαρμογή όπου οι χρήστες λαμβάνουν ειδοποίηση σε τυχαία στιγμή της ημέρας με μια τυχαία ερώτηση και έχουν περιορισμένο χρόνο για να δημοσιεύσουν την απάντησή τους.

---

## 📌 Πίνακας Περιεχομένων

- [Σχετικά με το Project](#-σχετικά-με-το-project)
- [Βασικά Χαρακτηριστικά](#-βασικά-χαρακτηριστικά)
- [Tech Stack](#-tech-stack)
- [Αρχιτεκτονική & Λειτουργία](#-αρχιτεκτονική--λειτουργία)
- [Εγκατάσταση & Εκτέλεση](#-εγκατάσταση--εκτέλεση)
- [Δομή Ομάδας](#-δομή-ομάδας-4-άτομα)

---

## 📝 Σχετικά με το Project

Το **Beans** είναι ένα social media. Μία φορά την ημέρα, σε τυχαία ώρα, όλοι οι χρήστες λαμβάνουν ταυτόχρονα μια ειδοποίηση με μια πρωτότυπη ή διασκεδαστική ερώτηση (π.χ. *"Πού είσαι αυτή τη στιγμή και τι βλέπεις;"*, *"Δείξε μας το πιο περίεργο αντικείμενο δίπλα σου"*).

Οι χρήστες έχουν περιορισμένο χρονικό παράθυρο για να ανεβάσουν την απάντησή τους (με φωτογραφία/κείμενο) ώστε να ξεκλειδώσουν τις δημοσιεύσεις των φίλων τους!

---

## ✨ Βασικά Χαρακτηριστικά

* ** Daily Random Notification:** Ταυτόχρονη αποστολή push notification σε όλους τους χρήστες σε τυχαία ώρα.
* ** Random Daily Prompt:** Διαφορετική θεματική ερώτηση κάθε ημέρα.
* ** Countdown Timer:** Περιορισμένος χρόνος αποκρίσεων για διατήρηση του αυθορμητισμού.
* ** Unlock System:** Βλέπεις τις δημοσιεύσεις των φίλων σου μόνο αφού απαντήσεις στη δική σου ερώτηση.
* ** Social Feed & Friends:** Προσθήκη φίλων, likes και σχόλια κάτω από τις απαντήσεις.
* ** Photo & Text Capture:** Δυνατότητα λήψης φωτογραφίας απευθείας από την εφαρμογή.

---

## 🛠️ Tech Stack

### Frontend (Mobile)
* **Framework:** React Native (Expo) 
* **State Management:** 
* **Real-time Updates:** 

### Backend & Database
* **Runtime / Framework:** Node.js (Express / NestJS) ή Python (FastAPI)
* **Database:** 
* **Push Notification **
* **Storage:** 
* **Task Scheduling:** 

---

## ⚙️ Αρχιτεκτονική & Λειτουργία

1. **Daily Trigger (Cron Job):**  
   Ο server εκτελεί ένα ημερήσιο scheduled task που επιλέγει μια τυχαία ώρα μέσα στη μέρα.
2. **Notification Broadcast:**  
   Τη συγκεκριμένη ώρα, το backend επιλέγει μια ερώτηση από τη βάση δεδομένων και στέλνει Push Notification μέσω FCM σε όλους τους χρήστες.
3. **User Action:**  
   Ο χρήστης ανοίγει το notification, βλέπει το χρονόμετρο να αντιμετρά, τραβάει φωτογραφία/γράφει την απάντηση και κάνει `POST` στο backend API.

---

## 🚀 Εγκατάσταση & Εκτέλεση

### Προαπαιτούμενα
* Node.js (v18+)
* Git
* Package Manager (`npm` ή `yarn`)

### 1. Clone το Repository
```bash
git clone [https://github.com/your-username/beans.git](https://github.com/your-username/beans.git)
cd beans
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

###3. Setup Frontend
```bash
cd frontend
npm install
npx expo start
```

👥 Δομή Ομάδας (4 άτομα)
​Frontend Developers (2):
​UI/UX Design & Component Implementation
​Camera Integration & Local Media Handling
​State Management & Push Notification Listeners
​Backend Developers (2):
​REST API / Database Schema Design
​Cron Job Architecture & Random Prompt Engine
​Push Notification Service Setup & Cloud Storage Integration
