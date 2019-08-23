import { Component, OnInit } from '@angular/core';
import { elasticlunr} from 'elasticlunr';

@Component({
  selector: 'pm-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss']
})
export class ProductSearchComponent implements OnInit {

  inputValue = 'term';

  constructor() { }

  ngOnInit() {
    const index = elasticlunr(function() {
      this.addField('title');
      this.addField('body');
      this.setRef('id');
    });

    index.search('');
  }

}
