import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject, Subject, merge, from } from 'rxjs';
import { catchError, tap, map, scan, shareReplay, mergeMap, toArray, filter, switchMap } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  private selectedProductAction = new Subject<number>();
  selectedProductId$ = this.selectedProductAction.asObservable();

  private insertProductSubject = new Subject<Product>();
  insertProductAction$ = this.insertProductSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategory$
  ]).pipe(
    map(([products, categorys]) =>
          products.map(product => ({
            ...product,
            price: product.price * 1.5,
            searchKey: [product.productName],
            category: categorys.find(fd => fd.id === product.categoryId).name
          }) as Product)
    ),
    shareReplay(1)
  );

  productWithAdd$ = merge(this.productsWithCategory$, this.insertProductAction$).pipe(
    scan((acc: Product[], value: Product) => [...acc, value])
  );

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.selectedProductId$
  ]).pipe(
    map(([products, selectedId]) =>
      products.find(f => f.id === selectedId)
    ),
    shareReplay(1),
    tap(selectedProduct => console.log(selectedProduct))
  );

  // selectedProductSuppliers$ = combineLatest([
  //   this.selectedProduct$,
  //   this.supplierService.suppliers$
  // ]).pipe(
  //   map(([selectedProduct, suppliers]) =>
  //     suppliers.filter(supplier => selectedProduct.supplierIds.includes(supplier.id))
  //   )
  // );

  selectedProductSuppliers$ = this.selectedProduct$.pipe(
    filter(selectedProduct => Boolean(selectedProduct)),
    switchMap(selectedProduct =>
      from(selectedProduct.supplierIds).pipe(
        mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
        toArray(),
        tap(suppliers => console.log(JSON.stringify(suppliers)))
      )
    )
  );


  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCategoryService: ProductCategoryService) { }



  selectedProductIdChange(id: number): void {
    this.selectedProductAction.next(id);
  }

  addNewProduct(value?: Product): void {
    const newValue = value || this.fakeProduct();
    this.insertProductSubject.next(newValue);
  }

  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
