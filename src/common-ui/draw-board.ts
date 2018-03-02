import { Board, Color } from "../common";

export function drawBoard(canvas: HTMLCanvasElement, board: Board) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const minDimension = Math.min(width, height);
    const { size, state } = board;
    const cellSize = minDimension / size;
    ctx.fillStyle =  "rgb(208, 184, 146)";
    ctx.fillRect(0, 0, minDimension, minDimension);
    state.forEach((color, index) => {
        if (color === Color.EMPTY) {
            return;
        }
        const { col, row } = board.toPos(index);
        const x = col * cellSize;
        const y = row * cellSize;
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = color === Color.BLACK ?
            "rgb(0, 0, 0)" :
            "rgb(255, 255, 255)";
        ctx.fill();
        if (index === board.placedAt) {
            ctx.strokeStyle = "rgb(255, 60, 60)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}
