import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import * as els from 'elasticlunr';
import { Observable, BehaviorSubject, of, from, fromEventPattern, combineLatest, observable, Subject, merge } from 'rxjs';
import { DOCS } from './document.config';
import { catchError, map, tap, scan } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Document } from './document';

@Component({
  selector: 'pm-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSearchComponent implements OnInit {

  tokenConfig = {
  fields: {
        title: {boost: 2},
        body: {boost: 1}
    },
    bool: 'OR',
    expand: true
  };

  elsModule = els(function() {
    this.addField('title');
    this.addField('body');
    this.setRef('id');
  });

  docForm: FormGroup;

  private keywordSubject = new BehaviorSubject<string>('Oracle');
  inputValueAction$ = this.keywordSubject.asObservable();

  private insertDocumentSubject = new Subject<Document>();
  insertDocumentAction$ = this.insertDocumentSubject.asObservable();

  docList$ = of(DOCS);

  documentsWithAdd$ = merge(this.docList$, this.insertDocumentAction$).pipe(
    scan((acc: Document[], value: Document) => {
      this.elsModule.addDoc(value);
      return [...acc, value];
    })
  );

  documents$ = combineLatest([
    this.documentsWithAdd$,
    this.inputValueAction$
  ]).pipe(
    map(([docs, keyword]) => {
      const searchResult = [...this.elsModule.search(keyword, this.tokenConfig)];

      return docs.filter(f => {
        if (keyword) {
          if (searchResult.length === 0 || !searchResult.find(fd => fd.ref === f.id.toString())) {
            return false;
          }
        }
        return true;
      });
    }),
    tap(doc => console.log('search result: ', doc))
  );


  constructor(private fb: FormBuilder) {
    this.docForm = this.fb.group({
      id: 6,
      title: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  ngOnInit() {
    DOCS.forEach(f => this.elsModule.addDoc(f));
    els.clearStopWords();
  }

  changedKeyword(newValue: string): void {
    this.keywordSubject.next(newValue);
  }

  addNewDoc(newDoc: Document) {
    this.insertDocumentSubject.next(newDoc);
    this.docForm.reset();
  }
}
