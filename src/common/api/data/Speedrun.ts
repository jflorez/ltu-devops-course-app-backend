export interface Game {
    id: string;
    name: string;
    description: string;
    console: string;
    releaseDate: Date;
}

export interface User {
    id: string;
    name: string;
    registeredAt: Date;
}

export interface Speedrun {
    id: string;
    game: Game;
    runner: User;
    time_ms: number;
    date: Date;
    category: Category;
}

export interface Category {
    id: string;
    name: string;
    description: string;
}
