import { Point } from "./GameTypes.js";

// Base post data
export type PostData = {
    postId: string;
    postType: string;
};

// Maze post
export type MazePostData = {
    postId: string;
    postType: string;
    data: number[];
    authorUsername: string;
    startPoint: Point,
    treasurePoint: Point,
    date: number;
    expired?: boolean;
    solves: number;
    skips: number;
    rowCount: number;
    colCount: number;
    moveCount: number;
};
  

// Pinned post
export type PinnedPostData = {
    postId: string;
    postType: string;
  };
  

export type PlayerPostData={
    points: Point[],
    time: number
}

export type LeaderboardEntry = {
    name: string;
    score: number; // sum amount seconds holding the flag
    rank: number;
  };
  
  export type Leaderboard = LeaderboardEntry[];
export const MAX_LEADERBOARD_ROWS=9;