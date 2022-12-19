import { Component, Input, OnInit } from '@angular/core';
import { JiraIssue } from 'src/app/dtos';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
})
export class StoryComponent implements OnInit {
  @Input() issue?: JiraIssue;
  ngOnInit() {}
}
