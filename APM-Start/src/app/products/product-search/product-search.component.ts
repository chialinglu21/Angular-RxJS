import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import * as els from 'elasticlunr';
import { Observable, BehaviorSubject, of, from, fromEventPattern, combineLatest, observable } from 'rxjs';
import { DOCS } from './document.config';
import { catchError, map, tap } from 'rxjs/operators';


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

  private keywordSubject = new BehaviorSubject<string>('2015');
  inputValueAction$ = this.keywordSubject.asObservable();

  searchNode = document.getElementById('search');

  docList$ = of(DOCS);

  documents$ = combineLatest([
    this.docList$,
    this.inputValueAction$
  ]).pipe(
    map(([docs, keyword]) =>
      docs.filter(f => {
        if (keyword) {
          const searchResult = this.elsModule.search(keyword);
          if (searchResult.length === 0 || !searchResult.find(fd => fd.ref === f.id.toString)) {
            return false;
          }
        }
        return true;
      })
    ),
    tap(doc => console.log(doc))
  );


  constructor() { }

  ngOnInit() {
    DOCS.forEach(f => this.elsModule.addDoc(f));

    // let resultEla = this.elsModule.search('2015', {
    //     fields: {
    //       title: { boost: 3},
    //       body: { boost: 2}
    //     }
    //   });

    // console.log(resultEla);
    //fromEventPattern(this.addChangeHandler).subscribe(console.log);

  }

  // addChangeHandler(handler) {
  //   document.addEventListener('input', handler);
  // }

  changedKeyword(): void {
    console.log(this.inputValueAction$);
  }

}
