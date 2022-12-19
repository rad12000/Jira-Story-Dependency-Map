import { Injectable } from '@angular/core';
import { JiraBoard, JiraBoardSprint } from '../dtos';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  get focusBoard() {
    const item = localStorage.getItem('FOCUS_BOARD');
    if (!item) return null;
    return JSON.parse(item) as JiraBoard;
  }

  set focusBoard(board: JiraBoard | null) {
    localStorage.setItem('FOCUS_BOARD', JSON.stringify(board));
  }

  get focusSprint() {
    const item = localStorage.getItem('FOCUS_SPRINT');
    if (!item) return null;
    return JSON.parse(item) as JiraBoardSprint;
  }

  set focusSprint(board: JiraBoardSprint | null) {
    localStorage.setItem('FOCUS_SPRINT', JSON.stringify(board));
  }

  get focusSprintStatus() {
    const item = localStorage.getItem('FOCUS_SPRINT_STATUS');
    return (item ?? 'active') as 'closed' | 'active' | 'future';
  }

  set focusSprintStatus(status: 'closed' | 'active' | 'future') {
    localStorage.setItem('FOCUS_SPRINT_STATUS', status);
  }
}
