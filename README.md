# 🔐 Password Generator

A simple, secure password generator built with **pure HTML, CSS, and JavaScript** — no frameworks, no libraries. Generates strong, random passwords based on user-defined criteria, with a dark green themed, fully responsive UI.

🔗 **Live Demo:** [your-live-url-here]
📦 **Repository:** [your-repo-url-here]

## ✨ Features

- Generate random passwords using `crypto.getRandomValues()` for true randomness (not `Math.random()`)
- Adjustable password length via slider (4–64 characters)
- Toggle character types:
  - Uppercase letters (A–Z)
  - Lowercase letters (a–z)
  - Numbers (0–9)
  - Special characters (!@#$%^&*)
- Password strength indicator (Weak / Fair / Good / Strong)
- One-click copy to clipboard with "Copied!" feedback
- Input validation — shows an error if no character type is selected
- Guarantees at least one character from each selected type
- Fully responsive design (mobile + desktop)

## 🛠️ Tech Stack

- HTML5
- CSS3 (custom styled slider, checkboxes, animations)
- Vanilla JavaScript (ES6+)
- Fonts: IBM Plex Mono (headings/password output) + Inter (body text)

No external libraries or frameworks were used.

## 📁 File Structure

password-generator/

├── index.html      # Page structure

├── style.css        # Styling and layout

└── script.js         # Password generation logic

## 🚀 How to Run Locally

```bash
git clone https://github.com/your-username/password-generator.git
cd password-generator
```

Then simply open `index.html` in your browser — no build step or server required.

## ⚙️ How It Works

1. The user selects a password length and one or more character types.
2. On clicking **Generate**, the script uses `crypto.getRandomValues()` to pick random characters.
3. At least one character from each selected type is guaranteed to appear in the result.
4. If no character type is selected, an error message is shown and no password is generated.
5. A strength meter evaluates the password based on length and character variety.

## 🙏 Acknowledgment

Built as part of the **Minor Project** under the **InternsElite** Program.
Assigned by: **Alok Maddheshiya (Program Mentor)**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
