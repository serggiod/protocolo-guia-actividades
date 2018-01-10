import { Component }  from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonResponse } from './app.interface.json.response';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public cssBtnCancelar : string;
  public cssBtnGuardar  : string;
  public cssBtnNuevo    : string;
  
  public d       : Date;
  public dias    : Array<string>;
  public meses   : Array<String>;
  public anios   : Array<string>;
  public horas   : Array<string>;
  public minutos : Array<string>;
  public lugares : Array<object>;  
  
  constructor(
    private http : HttpClient
  ){
    this.d       = new Date();
    this.dias    = new Array();
    this.meses   = new Array();
    this.anios   = new Array();
    this.horas   = new Array();
    this.minutos = new Array();
    this.lugares = new Array();


    for(let d=1;d<=31;d++) {let D = d.toString(); if(D.length===1) D = '0' +d; this.dias.push(D);}
    this.meses  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    for(let a=2050;a>=1983;a--){let A = a.toString(); this.anios.push(A);}
    for(let h=0;h<=24;h++) {let H = h.toString(); if(H.length===1) H = '0' +h; this.horas.push(H);}
    for(let m=0;m<=59;m++) {let M = m.toString(); if(M.length===1) M = '0' +m; this.minutos.push(M);}
    
    this.getActividadLugares();
    this.reset();

  }

  // Data.
  public getActividadLugares = () => {
    let url = '/rest/ful/webapps/protocolo/guia/index.php/lugares';
    this
      .http
      .get<JsonResponse>(url)
      .subscribe((json)=>{if(json.result===true)this.lugares = json.rows;});
  };

  // Actions.
  public reset    = () => {
    this.cssBtnCancelar = 'hide';
    this.cssBtnGuardar  = 'hide';
    this.cssBtnNuevo    = 'show';
  }

  public resetOff = () => {
    this.cssBtnCancelar = 'show';
    this.cssBtnGuardar  = 'show';
    this.cssBtnNuevo    = 'hide';
  }

  public cancelar = () => {
    this.reset();
    alert('Cancelar');
  }

  public guardar = () => {
    this.reset();
    alert ('Guardar');
  }

  public nuevo = ()=>{
    this.resetOff()
  }

}
