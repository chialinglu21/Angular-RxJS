import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from '../product.service';
import { Subject, BehaviorSubject, EMPTY, combineLatest } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { Product } from '../product';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  errorMessage = '';

  product$ =  this.productService.selectedProduct$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  pageTitle$ = this.product$.pipe(
    map((p: Product) => p ? `Product Detail for ${p.productName}` : null)
  );

  productSuppliers$ = this.productService.selectedProductSuppliers$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  vm$ = combineLatest([
    this.product$,
    this.pageTitle$,
    this.productSuppliers$
  ]).pipe(
    filter(([product]) => Boolean(product)),
    map(([product, pageTitle, productSuppliers]) => ({product, pageTitle, productSuppliers}))
  );

  constructor(private productService: ProductService) { }
}
