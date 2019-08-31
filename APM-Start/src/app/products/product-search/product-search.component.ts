import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import * as els from 'elasticlunr';
import { Observable } from 'rxjs';


@Component({
  selector: 'pm-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSearchComponent implements OnInit {

  inputValue$: Observable<string>;

  constructor() { }

  ngOnInit() {
    const elsModule = els(function() {
      this.addField('title');
      this.addField('body');
      this.setRef('id');
    });

    const doc1 ={
        'id': 1,
        'title': 'Oracle released its latest database Oracle 12g',
        'body': 'Yestaday Oracle has released its new database Oracle 12g, this would make more money for this company and lead to a nice profit report of annual year.'
    };

    const doc2 = [{
        'id': 1,
        'title': 'Oracle released its latest database Oracle 12g',
        'body': 'Yestaday Oracle has released its new database Oracle 12g, this would make more money for this company and lead to a nice profit report of annual year.'
    },{
        'id': 2,
        'title': 'Oracle released its profit report of 2015',
        'body': 'As expected, Oracle released its profit report of, during the good sales of database and hardware, Oracle\'s profit of reached 12.5 Billion.'
    },{
        'id': 3,
        'title': 'MySQL released its profit report of',
        'body': 'As expected, MySQL released its profit report of 2015, during the good sales of database and hardware,  profit of 2015 reached 12.5 Billion.'
    }];

    doc2.forEach(f => elsModule.addDoc(f));

    //this.inputValue$.subscribe(console.log) ;

    let resultEla = elsModule.search(this.inputValue$, {
        fields: {
          title: { boost: 3},
          body: { boost: 2}
        }
      });

    console.log(elsModule);
    console.log(resultEla);
    // const index = elasticlunr(function() {
    //   this.addField('title');
    //   this.addField('body');
    //   this.setRef('id');
    // });

  }

}
