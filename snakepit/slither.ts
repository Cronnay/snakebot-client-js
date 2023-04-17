import { snakeConsole as console } from '../src/client';
import { Coordinate, GameMap } from '../src/utils';
import { MessageType } from '../src/messages';
import { GameSettings, Direction, RelativeDirection, GameMode } from '../src/types';
import type { GameStartingEventMessage, Message, SnakeDeadEventMessage } from '../src/types_messages';
const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];

let maxTick = 250;

export async function getNextMove(gameMap: GameMap, gameSettings: GameSettings, gameTick: number) {
  const potentialMoves = directions.filter(dir => gameMap.playerSnake.canMoveInDirection(dir));
  if (potentialMoves.length == 1) {
    return potentialMoves[0]
  }

  const mapOfMoves = new Map<Direction, number>(potentialMoves.map(dir => [dir, 0]));
  potentialMoves.forEach(dir => checkAround(gameMap, dir, mapOfMoves, gameMap.playerSnake.headCoordinate.translateByDirection(dir), 0));

  let highestValue = { dir: Direction.Up, v: 0 }
  mapOfMoves.forEach((value, key) => {
    if (value > highestValue.v) {
      highestValue = { dir: key, v: value }
    }
  });
  return highestValue.dir;
}

function checkAround(gameMap: GameMap, initialMovement: Direction, mapOfMoves: Map<Direction, number>, headCoords: Coordinate, depth: number) {
  const maxDepth = maxTick > 500 ? 9 : 8;
  if (depth == maxDepth) {
    return null;
  }
  const getPotentionalMoves = directions.filter(dir => {
    const nextCoord = headCoords.translateByDirection(dir);
    return gameMap.isTileFree(nextCoord);
  });
  mapOfMoves.set(initialMovement, mapOfMoves.get(initialMovement)! + 1);
  getPotentionalMoves.forEach(dir => {
    checkAround(gameMap, initialMovement, mapOfMoves, headCoords.translateByDirection(dir), depth + 1)
  });
}

// This handler is optional
export function onMessage(message: Message) {
  switch (message.type) {
    case MessageType.GameStarting:
      maxTick = (message as GameStartingEventMessage).gameSettings.timeInMsPerTick
      // Reset snake state here
      break;
    case MessageType.SnakeDead:
      message = message as SnakeDeadEventMessage; // Cast to correct type
      // Check how many snakes are left and switch strategy
      break;
  }
}

// Settings ommitted are set to default values from the server, change this if you want to override them
export const trainingGameSettings = {
  // timeInMsPerTick: 3000
  // maxNoofPlayers: 2,
  // obstaclesEnabled: false,
  // ...
} as GameSettings;
