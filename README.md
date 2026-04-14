# Tic Tac Toe (C++ AI in WebAssembly)

A browser-based Tic Tac Toe game with an unbeatable AI opponent written in C++ and compiled to WebAssembly (WASM) using Emscripten. Everything runs entirely in your browser—no server required!

## Features
- Play Tic Tac Toe against a C++ AI (Minimax + AlphaBeta pruning)
- Fast, interactive UI (HTML/CSS/JS)
- All logic runs client-side via WebAssembly
- Win/draw detection and restart button

## Project Structure
```
├── index.html         # Main HTML file
├── style.css          # Game styling
├── main.js            # Game logic and JS↔WASM integration
└── wasm/
    ├── tictactoe.cpp  # C++ AI source code
    ├── tictactoe.js   # Emscripten JS glue (generated)
    └── tictactoe.wasm # WebAssembly binary (generated)
```
## How It Works
- The frontend is a simple static site (HTML/CSS/JS).
- The AI logic is written in C++ and compiled to WASM.
- JavaScript communicates with the WASM module to get the AI's move.

## Building the WASM Module
1. **Install Emscripten:**
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```
2. **Compile the C++ AI:**
   ```bash
   cd wasm
   emcc tictactoe.cpp -O3 -s WASM=1 -s EXPORTED_FUNCTIONS='["_find_best_move","_malloc","_free"]' -o tictactoe.js
   ```

## Play
- Click a cell to make your move (you are X).
- The AI (O) will respond instantly.
- Win, lose, or draw—the game will display the result and let you restart.
