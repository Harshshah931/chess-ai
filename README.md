# ♟️ Chess AI

A fully playable browser-based chess game where you battle an AI opponent powered by the **Minimax algorithm with Alpha-Beta Pruning**. Built with Next.js and TypeScript — no server required, runs entirely in the browser.

🔗 **Live Demo → [chess-ai-smoky.vercel.app](https://chess-ai-smoky.vercel.app/)**

---

## 📸 Preview

> <img width="1017" height="805" alt="image" src="https://github.com/user-attachments/assets/9c06f2be-a1f1-48ba-b659-ea584a964400" />


---

## 🧠 How the AI Works

The AI uses two classical game-theory algorithms:

**Minimax** — The AI thinks ahead by simulating all possible moves for itself and the opponent, then picks the move that leads to the best outcome assuming the opponent also plays optimally.

**Alpha-Beta Pruning** — An optimization on top of Minimax that cuts off branches of the game tree that can't possibly affect the final decision. This makes the AI significantly faster without changing the result — allowing deeper search in less time.

**Evaluation Function** — Each board position is scored based on:
- Material count (pawn = 1, knight/bishop = 3, rook = 5, queen = 9)
- Piece-square tables (positional bonuses for well-placed pieces)
- King safety

**Difficulty Levels:**
| Level  | Search Depth | Description |
|--------|-------------|-------------|
| Easy   | 1 ply       | Looks 1 move ahead |
| Medium | 3 plies     | Balanced challenge |
| Hard   | 5 plies     | Strong opponent |

---

## ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework, routing |
| TypeScript | Type-safe codebase |
| Tailwind CSS | Styling |
| Chess.js | Move validation and game rules |
| Recharts | Position evaluation chart |
| Vercel | Free deployment |

---

## 🚀 Features

- ♟️ Fully playable chess with all standard rules (castling, en passant, promotion)
- 🤖 AI opponent using Minimax + Alpha-Beta Pruning
- 🎯 3 difficulty levels — Easy, Medium, Hard
- 📊 Real-time position evaluation chart
- 📜 Move history panel
- ↩️ Undo move button
- 🔄 New game button
- 🔁 Flip board option
- 🔊 Sound effects
- 🌐 Browser-only — no backend, no server

---

## 🛠️ Run Locally

Make sure you have **Node.js** and **Git** installed first.

```bash
# Clone the repository
git clone https://github.com/Harshshah931/chess-ai.git

# Navigate into the project
cd chess-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:4028](http://localhost:4028) in your browser.

---

## 📁 Project Structure

```
chess-ai/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ChessBoard.tsx        # Board rendering and interaction
│   │   │   ├── ChessGameBoard.tsx    # Main game component
│   │   │   ├── EvalChart.tsx         # Position evaluation graph
│   │   │   ├── GameStatusBanner.tsx  # Win/loss/draw display
│   │   │   ├── MoveHistoryPanel.tsx  # Move log
│   │   │   ├── PromotionDialog.tsx   # Pawn promotion UI
│   │   │   ├── SidePanel.tsx         # Right side panel
│   │   │   └── TopBar.tsx            # Header bar
│   │   └── page.tsx                  # Main page
│   └── lib/
│       ├── ai.ts                     # Minimax + Alpha-Beta engine
│       ├── evaluation.ts             # Board scoring logic
│       ├── gameState.ts              # Game state management
│       └── pieces.ts                 # Piece definitions
```

---

## 👥 Contributors

| Name | College | Branch | Contribution |
|------|---------|--------|-------------|
| **Harsh Shah** | TCET Mumbai | B.Tech AI/ML | AI engine — Minimax algorithm, Alpha-Beta Pruning, evaluation function |
| **Kabir Patel** | RGIT Mumbai | B.Tech IT | UI components, board rendering, Vercel deployment, README |

---

## 📌 What We Learned

- Implementing Minimax with Alpha-Beta Pruning from scratch in TypeScript
- How piece-square tables improve AI positional play
- Next.js App Router and client-side rendering
- Real-world GitHub collaboration across two different universities
- CI/CD deployment workflow using Vercel + GitHub

---

## 🔮 Future Improvements

- [ ] Add opening book for stronger early game
- [ ] Multiplayer mode (two players on same device)
- [ ] Mobile responsive design
- [ ] Move timer per turn
- [ ] Save and load game feature

---

<p align="center">Made with ♟️ by Harsh Shah & Kabir Patel | TCET × RGIT</p>
