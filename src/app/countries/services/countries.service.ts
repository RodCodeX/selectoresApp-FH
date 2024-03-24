import { Injectable } from '@angular/core';
import { Country, Region, SmailCountry as SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {

  private baseUrl:string = 'https://restcountries.com/v3.1';

  //?Creamos un arreglo de tipo Region
  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];

  constructor(private http:HttpClient) {}

  //?Retornamos el arreglo de regiones pero la copia
  get regions(): Region[] {
    return [...this._regions];
  }


  getCountriesByRegion(region:Region):Observable<SmallCountry[]>{
    if(!region) return of ([]); //?Devolvemos un arreglo vacio pero de tipo observable con (of);  // Para que no llego vacio region
    const url : string= `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;
    return this.http.get<Country[]>(url)
    .pipe(
      map(countries => countries.map(country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
      }))),
      // tap(response => console.log(response))                                    //?Tap es un operador que realiza efectos secundarios 
    )
  }


  getCountryByAlphaCode( alphaCode:string ):Observable<SmallCountry>{
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<Country>(url)
    .pipe(
      map( country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
      }))
    )
  }

  getCountryBorderByCodes(borders:string[]):Observable<SmallCountry[]>{
    if(!borders || borders.length === 0 ) return of([]);

    const contriesRequest:Observable<SmallCountry>[] = [];
    borders.forEach(code=>{
      const request = this.getCountryByAlphaCode(code);
      contriesRequest.push(request);
    });
    return combineLatest(contriesRequest);
  }
}
