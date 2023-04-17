import { snakeConsole as console } from '../src/client';
import { GameMap, Coordinate } from '../src/utils';
import { MessageType } from '../src/messages';
import { GameSettings, Direction, RelativeDirection, TileType } from '../src/types';
import type { GameStartingEventMessage, Message, SnakeDeadEventMessage } from '../src/types_messages';


const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];

export async function getNextMove(gameMap: GameMap): Promise<Direction> {
  const possibleMoves = directions.filter(direction => gameMap.playerSnake.canMoveInDirection(direction)); //Filters safe directions to move in
  if (possibleMoves.length === 1) {
    return possibleMoves[0]
  }

  const direction = new Map<Direction, number>(possibleMoves.map(move => [move, 0]));
  possibleMoves.forEach(dir => {
    let head = gameMap.playerSnake.headCoordinate;

    let isPossible = true;
    let amountOfSteps = 0;
    while (isPossible) {
      head = head.translateByDirection(dir)
      if (gameMap.isTileFree(head)) {
        amountOfSteps++;
      } else {
        isPossible = false;
      }
    }
    direction.set(dir, amountOfSteps);
  });
  let highestValueFromMove = 0;
  let valueOfHighestdirectory = possibleMoves[0]
  direction.forEach((v, dir) => {
    if (v > highestValueFromMove) {
      highestValueFromMove = v;
      valueOfHighestdirectory = dir;
    }
  });

  if (highestValueFromMove >= 20) {
    return valueOfHighestdirectory
  }

  possibleMoves.forEach(dir => checkAround(gameMap, dir, direction, gameMap.playerSnake.headCoordinate.translateByDirection(dir), 0));

  let highestValue = { dir: Direction.Up, v: 0 }
  direction.forEach((value, key) => {
    if (value > highestValue.v) {
      highestValue = { dir: key, v: value }
    }
  });
  return highestValue.dir;
}

function checkAround(gameMap: GameMap, initialMovement: Direction, mapOfMoves: Map<Direction, number>, headCoords: Coordinate, depth: number) {
  const maxDepth = 8;
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

export function onMessage(message: Message) {
  switch (message.type) {
    case MessageType.GameStarting:
      message = message as GameStartingEventMessage; // Cast to correct type
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
  // maxNoofPlayers: 2,
  // obstaclesEnabled: false,
  // ...
} as GameSettings;
