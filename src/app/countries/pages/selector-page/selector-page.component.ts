import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmailCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styleUrls: ['./selector-page.component.css'],
})
export class SelectorPageComponent implements OnInit {
  countriesByRegion: SmailCountry[] = [];  //?Array para countries
  borders: SmailCountry[]= [];

  myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private _countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this._countriesService.regions;
  }

  //?SwitchMap para tener dos suscribe en un metodo
  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap(()=> this.myForm.get('country')!.setValue('')),    //?Ejecutar un evento secundario para resetear el segundo select country 
        tap(()=> this.borders = []),    //?Ejecutamos un evento secundario para limpiar borders
        switchMap((region) =>
          this._countriesService.getCountriesByRegion(region)
        )
      )
      .subscribe((countries) => {
        // console.log({ countries });
        this.countriesByRegion = countries;
      });
  }

  onCountryChanged():void{
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap(()=> this.myForm.get('border')!.setValue('')),    //?Ejecutar un evento secundario para resetear el segundo select country 
        filter((value:string)=>value.length > 0),  //?Filter recibe el valor anterior (value), si yo regreo un TRUE continua con el switchMap para ejecutar el metodo
        switchMap((alphaCode) =>this._countriesService.getCountryByAlphaCode(alphaCode)),
        switchMap(contry => this._countriesService.getCountryBorderByCodes(contry.borders))
      )
      .subscribe((contries) => {
        console.log({contries});
        this.borders = contries;
      });
  }

  /**
   * ! NOTA TAP :  Ejecto secundario
   * ! SwitchMap : toma el valor del observable anterior y se suscribe a un nuevo observable
   */
}
