#include <emscripten.h>
#include <algorithm>
#include <climits>

extern "C" {

char player = 'o';
char opponent = 'x';

struct Move {
	int row, col;
};

bool	isMovesLeft(char board[3][3])
{
	for (int i = 0; i < 3; i++)
		for (int j = 0; j < 3; j++)
			if (board[i][j] == '_')
				return true;
	return false;
}

int	evaluate(char b[3][3])
{
	for (int row = 0; row < 3; row++)
	{
		if (b[row][0] == b[row][1] && b[row][1] == b[row][2])
		{
			if (b[row][0] == player) return +10;
			else if (b[row][0] == opponent) return -10;
		}
	}
	for (int col = 0; col < 3; col++)
	{
		if (b[0][col] == b[1][col] && b[1][col] == b[2][col])
		{
			if (b[0][col] == player) return +10;
			else if (b[0][col] == opponent) return -10;
		}
	}
	if (b[0][0] == b[1][1] && b[1][1] == b[2][2])
	{
		if (b[0][0] == player) return +10;
		else if (b[0][0] == opponent) return -10;
	}
	if (b[0][2] == b[1][1] && b[1][1] == b[2][0])
	{
		if (b[0][2] == player) return +10;
		else if (b[0][2] == opponent) return -10;
	}
	return 0;
}

int negamax(char board[3][3], int depth, int alpha, int beta, int color)
{
    int score = color * evaluate(board);
    if (score > 0) return score - depth;
    if (score < 0) return score + depth;
    if (!isMovesLeft(board)) return 0;

    int best = -100000;
    for (int i = 0; i < 3; i++)
    {
        for (int j = 0; j < 3; j++)
        {
            if (board[i][j] == '_')
            {
                board[i][j] = (color == 1) ? player : opponent;
                int val = -negamax(board, depth + 1, -beta, -alpha, -color);
                board[i][j] = '_';
                best = std::max(best, val);
                alpha = std::max(alpha, val);
                if (alpha >= beta) return best;
            }
        }
    }
    return best;
}

EMSCRIPTEN_KEEPALIVE
int	find_best_move(char* board_flat)
{
	char board[3][3];
	for (int i = 0; i < 3; i++)
		for (int j = 0; j < 3; j++)
			board[i][j] = board_flat[i * 3 + j];
	int bestVal = INT_MIN;
	Move bestMove = {-1, -1};
	for (int i = 0; i < 3; i++)
	{
		for (int j = 0; j < 3; j++)
		{
			if (board[i][j] == '_')
			{
				board[i][j] = player;
				int moveVal = -negamax(board, 1, -100000, 100000, -1);
				board[i][j] = '_';
				if (moveVal > bestVal)
				{
					bestMove.row = i;
					bestMove.col = j;
					bestVal = moveVal;
				}
			}
		}
	}
	// Pack row and col into a single int (row in high byte, col in low byte)
	return (bestMove.row << 8) | bestMove.col;
}

} // extern "C"
