import { URLString } from "../common/types";

export interface JiraBoardSprint {
    id: string;
    self: URLString;
    state: "active" | "closed" | "future";
    name: string;
    startDate: string;
    endDate: string;
    activatedDate: string;
    originBoardId: string;
    goal: string;
}