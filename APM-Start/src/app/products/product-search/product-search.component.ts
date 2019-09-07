import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import * as els from 'elasticlunr';
import { Observable, BehaviorSubject, of, from, fromEventPattern, combineLatest, observable } from 'rxjs';
import { DOCS } from './document.config';
import { catchError, map, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Document } from './document';

@Component({
  selector: 'pm-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSearchComponent implements OnInit {

  elsModule = els(function() {
    this.addField('title');
    this.addField('body');
    this.setRef('id');
  });

  docForm: FormGroup;

  private keywordSubject = new BehaviorSubject<string>('Oracle');
  inputValueAction$ = this.keywordSubject.asObservable();

  docList$ = of(DOCS);

  documents$ = combineLatest([
    this.docList$,
    this.inputValueAction$
  ]).pipe(
    map(([docs, keyword]) => {
      const searchResult = [...this.elsModule.search(keyword)];

      return docs.filter(f => {
        if (keyword) {
          if (searchResult.length === 0 || !searchResult.find(fd => fd.ref === f.id.toString())) {
            return false;
          }
        }
        return true;
      });
    }),
    tap(doc => console.log(doc))
  );


  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    DOCS.forEach(f => this.elsModule.addDoc(f));
    this.elsModule.clearStopWords();

    this.docForm = this.fb.group(new Document());
  }

  changedKeyword(newValue: string): void {
    this.keywordSubject.next(newValue);
  }

}
