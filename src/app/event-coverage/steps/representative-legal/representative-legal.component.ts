import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-representative-legal',
  imports: [FormsModule],
  templateUrl: './representative-legal.component.html',
  styleUrls: ['./representative-legal.component.scss', '../../../app.component.scss']
})
export class RepresentativeLegalComponent {
    @Input() form!: FormGroup;

    get representativeLastname() {
        return this.form.get('representativeLastname')?.value || '';
    }

    set representativeLastname(value: string) {
        this.form.patchValue({ representativeLastname: value });
    }

    get representativeFirstname() {
        return this.form.get('representativeFirstname')?.value || '';
    }

    set representativeFirstname(value: string) {
        this.form.patchValue({ representativeFirstname: value });
    }

    get representativeEmail() {
        return this.form.get('representativeEmail')?.value || '';
    }

    set representativeEmail(value: string) {
        this.form.patchValue({ representativeEmail: value });
    }
}
