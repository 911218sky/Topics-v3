import { GameClassify } from "@prisma/client";

export type GameClassifyFieldKeys = keyof GameClassify;
export type CreateGame = {
  gameName: string;
  gameContent: string;
  playTime: number;
  classifys: GameClassifyFieldKeys[];
  imgId?: string;
};
