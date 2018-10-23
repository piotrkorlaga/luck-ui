import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HappeningService } from './happening.service';
import { Happening, INIT_FORM_HAPPENING } from './happening.model';
import { ParticipantUniqueLinkData } from '../../participation-happening/participation-happening/participation-happening.model';

@Component({
  selector: 'lk-happening-page',
  templateUrl: './happening-page.component.html',
  styleUrls: ['./happening-page.component.scss']
})

export class HappeningPageComponent implements OnInit, OnDestroy {
  public happeningId: string;

  public model: Happening;
  public form: FormGroup;
  public participantList: FormArray;

  public name = '';
  public description = '';
  public participantUniqueLinkData: ParticipantUniqueLinkData[] = [];

  private max = 2;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private happeningService: HappeningService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.ngUnsubscribe)
    )
      .subscribe((params) => this.happeningId = params['id']);
    this.initForm({ ...INIT_FORM_HAPPENING, ...this.model });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private initForm(model: Happening) {

    this.form = this.formBuilder.group({
      name: [model.name],
      description: [model.description],
      participantList: this.formBuilder.array([this.createParticipant()]),
    });
  }

  private createParticipant(): FormGroup {
    return this.formBuilder.group({
      name: '',
    });
  }

  private clearEmpty() {
    this.participantList = this.forParticipantList;
    this.participantList.controls.forEach((participant, index) => {
      if (participant.value.name === '' && this.participantList.length !== index + 1) {
        this.participantList.removeAt(index);
      }
    });
  }

  public get forParticipantList() {
    return this.form.get('participantList') as FormArray;
  }

  public addParticipant(event: any, i): void {
    this.clearEmpty();

    if (event.target.value === '') {
      return;
    }

    this.participantList = this.forParticipantList;

    if (this.participantList.length === i) {
      ++this.max;
      this.participantList.push(this.createParticipant());
    }
  }

  public clickedSave() {
    this.participantList = this.forParticipantList;
    const index = this.participantList.length - 1;
    if (this.participantList.controls[index].value.name === '') {
      this.participantList.removeAt(index);
    }

    this.happeningService.generateDetailedParticipantListInformation(this.happeningId, this.form.value).pipe(
      tap((participantUniqueLinkData) => this.participantUniqueLinkData = participantUniqueLinkData),
      tap(() => this.name = this.form.get('name').value),
      tap(() => this.description = this.form.get('description').value)
    )
      .subscribe();
  }
}
