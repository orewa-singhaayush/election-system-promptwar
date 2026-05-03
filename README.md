# 🗳️ VoteAssist – Interactive Election Assistant

An interactive web application that simplifies the **election process, voting steps, and important timelines** for users through a clean UI and AI-powered assistance.

---

## 🚀 Overview

**VoteAssist** is designed to make voting awareness easy and engaging.  
It provides a **step-by-step voting guide, election timelines, FAQs, and an AI chatbot** to help users understand everything about elections.

This project focuses on improving **voter awareness**, especially for first-time voters.

---

## ✨ Features

### 🧭 1. Step-by-Step Voting Guide
- Interactive stepper UI
- Covers:
  - Registration
  - Verification
  - Voting process
  - Final submission

---

### 📆 2. Election Timeline
- Important deadlines like:
  - Registration start & end
  - Early voting
  - Election day
- Visual timeline with status indicators

---

### 🤖 3. AI Chat Assistant
- Ask questions like:
  - "How to vote?"
  - "What ID is required?"
- Instant responses via backend API

---

### 📝 4. Voter Registration Form
- Full structured form (Form 6 style)
- Includes:
  - Personal details
  - Address details
  - Constituency info

---

### 🔍 5. Registration Status Checker
- Check via:
  - Voter ID  
  - Name + PIN Code  

---

### ❓ 6. FAQ Section
- Flip-card UI for quick answers:
  - ID requirements  
  - Registration process  
  - Polling booth info  

---

### 🖼️ 7. Gallery Section
- Visual representation of:
  - Voting scenes  
  - Campaign awareness  
  - Citizen participation  

---

### 🎨 8. Modern UI/UX
- Responsive design  
- Dark/Light mode toggle  
- Glassmorphism UI  
- Animations & transitions  

---

## 🛠️ Tech Stack

### Frontend
- HTML5  
- CSS3  
- JavaScript (DOM + Events)

### Backend
- Node.js  
- Express.js  

### Other
- JSON (data storage)
- Fetch API (frontend ↔ backend communication)

---

## 📁 Project Structure

```bash
election-system-promptwar/
│
├── client/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js
│   └── assets/
│       ├── india_voting_scene.png
│       ├── india_voting_queue.png
│       └── india_election_campaign.png
│
├── server/
│   ├── server.js
│   ├── voters.json
│
├── .env
├── package.json
├── README.md
└── .gitignore
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/election-system-promptwar.git
cd election-system-promptwar
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create `.env` file
```env
PORT=3000
```

### 4️⃣ Run the backend server
```bash
node server/server.js
```

### 5️⃣ Open the app
Open in browser:
```
http://localhost:3000
```

---

## 🧩 How It Works

1. User interacts with UI (guide / chatbot / forms)
2. Frontend sends request using Fetch API
3. Backend processes request
4. Response is displayed instantly

---

## 📌 Use Cases

- 🧑‍🎓 First-time voters  
- 🏫 College projects  
- 🗳️ Election awareness campaigns  
- 📚 Educational demos  

---

## 🔮 Future Improvements

- 🔐 Authentication system  
- 🌍 Multi-language support  
- 📱 Mobile-first optimization  
- 🤖 Advanced AI (GPT-based responses)  
- 🗺️ Real-time election data integration  

---

## 👨‍💻 Author

**Aayush Kumar Singh**  
💻 Computer Engineering Student  
🔐 Cybersecurity Enthusiast  

---

## 📜 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!