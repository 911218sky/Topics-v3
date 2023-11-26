export type CreatMenu = {
  game: number[];
  menuName: string;
  menuContent: string;
  gameDifficulty: string[];
  isPublic: boolean;
  totalTime: number;
};

export type Distribute = {
  usersId: number[];
  menuId: number;
  startTime: Date;
  endTime: Date;
};
