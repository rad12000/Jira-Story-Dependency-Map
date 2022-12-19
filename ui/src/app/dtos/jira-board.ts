import { URLString } from "../common/types";

export interface JiraBoard {
    id: string;
    self: URLString;
    name: string;
    type: "scrum" | "kanban";
}