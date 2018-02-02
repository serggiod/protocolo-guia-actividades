/**
 * @components : HttpClient, SessionService, Component, OnInit, TemplateRef, BsModalService, BsModalRef.
 */
import { HttpClient }         from '@angular/common/http';
import { SessionService }     from './app.service.session';
import { Component, OnInit, TemplateRef }  from '@angular/core';
import { BsModalService }     from 'ngx-bootstrap/modal';
import { BsModalRef }         from 'ngx-bootstrap/modal/bs-modal-ref.service';

/**
 * @interfaces : Mes, Alert, Fecha, Eventos, Lugares, Fotografia, FotografiaDelete, Jsonresponse.
 */
import { Mes }                from './app.interface.mes';
import { Alert }              from './app.interface.alert';
import { Fecha }              from './app.interface.fecha';
import { Eventos }            from './app.interface.eventos';
import { Lugares }            from './app.interface.lugares';
import { Fotografia }         from './app.interface.fotografia';
import { FotografiaDelete}    from './app.interface.fotografia.delete';
import { JsonResponse }       from './app.interface.json.response';

/**
 * @decorator : 
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SessionService,HttpClient]
})

/**
 * @class AppComponent
 * Clase que desarrolla un modulo que se integra en http://www.legislaturajujuy.gov.ar/webapps/
 * y permite, a la Jefatura de Protocolo, administrar una guia de actividades
 * virtual con la posibilidad de publicar sus eventos en la página web.
 */
export class AppComponent implements OnInit {
  private modalRef      : BsModalRef;
  private eventoIndex   : number;

  public d              : Date;
  public dias           : Array<string>;
  public meses          : Array<Mes>;
  public anios          : Array<string>;
  public horas          : Array<string>;
  public minutos        : Array<string>;
  public lugares        : Array<Lugares>;
  
  public page           : string;
  public cssLugarA      : string;
  public cssLugarB      : string;

  public evento         : Eventos;
  public eventos        : Array<Eventos>;
  public lugar          : Lugares;

  public cssNuevo       : string;
  public cssBtnNuevo    : string;
  public cssBtnCancelar : string;
  public cssBtnGuardar  : string;
  
  public alertEvento    : Alert;
  public alertLugares   : Alert;
  public alertFotografia: Alert;

  public editMode       : boolean;
  public fotografiaD    : FotografiaDelete;

  /**
   * @constructor contructor().
   * Constructor de la clase, recibe tres parámetros.
   * 
   * @param http : Una referencia al servicio para realizar peticiones remotas a un servico proveedor de datos implementado en REST.
   * @param session : Una referecnia al servicio para realizar el manejo de autorizaciones en peticiones remotas.
   * @param modalService : Una referencia al serviceo interno para administrar la visualización de ventanas de dialogo modales dentro de la aplicación.
   */
  constructor(
    private http        : HttpClient,
    private session     : SessionService,
    private modalService: BsModalService
  ){
    this
      .session
      .autorize(()=>{
        this.page = 'show';
      });
  }

  /**
   * @constructor ngOnInit(). 
   * Segundo constructor de la clase que permite la inicialización de las
   * propiedades, además de automatizar la ejecución de los primeros
   * métodos.
   */
  ngOnInit() {
    this.d       = new Date();
    this.dias    = new Array();
    this.meses   = new Array();
    this.anios   = new Array();
    this.horas   = new Array();
    this.minutos = new Array();
    this.lugares = new Array();
    this.eventos = new Array();
    this.page    = 'hide';

    this.evento  = {
      lugar:{
        name:'',
        uriname:'',
        description:''
      },
      uriname:'',
      name:'',
      description:'',
      invites:'',
      date:{
        dia:'',
        mes:'',
        anio:'',
        hora:'',
        minutos:''
      },
      status:'',
      fotografias:new Array()
    };
 
    this.lugar   = {name:'',uriname:'',description:''};
    this.fotografiaD = {
      indexEvento: 0,
      indexFotografia : 0,
      file: null
    };

    for(let d=1;d<=31;d++) {let D = d.toString(); if(D.length===1) D = '0' +d; this.dias.push(D);}
    this.meses = [
      {name:'Enero'   ,value:'01'},
      {name:'Febrero' ,value:'02'},
      {name:'Marzo'   ,value:'03'},
      {name:'Abril'   ,value:'04'},
      {name:'Mayo'    ,value:'05'},
      {name:'Junio'   ,value:'06'},
      {name:'Julio'   ,value:'07'},
      {name:'Agosto'  ,value:'08'},
      {name:'Septiembre',value:'09'},
      {name:'Octubre' ,value:'10'},
      {name:'Noviembre' ,value:'11'},
      {name:'Diciembre' ,value:'12'}
    ];
    for(let a=this.d.getFullYear();a>=1983;a--){let A = a.toString(); this.anios.push(A);}
    for(let h=0;h<=24;h++) {let H = h.toString(); if(H.length===1) H = '0' +h; this.horas.push(H);}
    for(let m=0;m<=59;m++) {let M = m.toString(); if(M.length===1) M = '0' +m; this.minutos.push(M);}

    this.alertEvento     = {type:'',text:''};
    this.alertLugares    = {type:'',text:''};
    this.alertFotografia = {type:'',text:''};
    
    this.resetOff();
  }
  

  /**
   * @method : httpGetEventos().
   */
  private httpGetEventos       = () => {
    this
      .session
      .autorize(()=>{
        let url = '/rest/ful/webapps/protocolo/guia/index.php/eventos';
        this
          .http
          .get<JsonResponse>(url)
          .subscribe((json)=>{if(json.result===true)this.eventos = json.rows;});
      });
  };

  /**
   * @method : httpPostAndPutEvento().
   */
  private httpPostAndPutEvento = () => {
    this
      .session
      .autorize(()=>{
        let url                 = '/rest/ful/webapps/protocolo/guia/index.php/evento';
        this.evento.name        = (this.evento.name.match(new RegExp('[a-zA-Z0-9 .,-áéíóúÁÉÍÓÚñÑ]{1,150}','g'))).join().replace(/,/g,'');
        this.evento.description = (this.evento.description.match(new RegExp('[a-zA-Z0-9 .;,-áéíóúÁÉÍÓÚñÑ]{1,150}','g'))).join().replace(/,/g,'');
        this.evento.invites     = (this.evento.invites.match(new RegExp('[a-zA-Z0-9 .;,-áéíóúÁÉÍÓÚñÑ]{1,150}','g'))).join().replace(/,/g,'');

        // inserta.
        if(this.editMode===false){
          this.evento.uriname = this.evento.name.toLowerCase().replace(/ /g,'-');
          this
            .http
            .post<JsonResponse>(url,this.evento)
            .subscribe((json)=>{
              if(json.result===true){
                this.alertEvento.type = 'alert-success';
                this.alertEvento.text = 'El evento se ha guardado en forma correcta.';
                setTimeout(this.resetOff,1500);
              }
            },(e)=>{
              this.alertEvento.type = 'alert-danger';
              this.alertEvento.text = 'No se pudo conectar con el servidor.';
            });
        }

        // o modifica.
        if(this.editMode===true){
          url += '/' + this.evento.uriname;
          this
            .http
            .put<JsonResponse>(url,this.evento)
            .subscribe((json)=>{
              if(json.result===true){
                this.alertEvento.type = 'alert-success';
                this.alertEvento.text = 'El evento se ha modificado en forma correcta.';
                setTimeout(this.resetOff,1500);
              }
            },(e)=>{
              this.alertEvento.type = 'alert-danger';
              this.alertEvento.text = 'No se pudo conectar con el servidor.';
            });
        }
        
      });
  };

  /**
   * @method : httpPostEventoPrint().
   */
  private httpPostEventoPrint  = () => {
    this
      .session
      .autorize(()=>{
        this.resetDate();

        let html = '';
        html += '<style>';
        html += '*{font-family:Arial,Sans-Serif;font-size:8pt;color:#000000;}';
        html += '.table-common {width:100%; border:0; text-align:left; }';
        html += '.header{width:100%;background-color:#fff;text-align:center;font-family: Arial, Helvetica, sans-serif;}';
        html += '.escudo{width:40px;}';
        html += '.institucion{display: block;font-weight: bold;font-size: 9pt;}';
        html += '.ceremonial{display: block;font-size: 10pt;}';
        html += '.fecha{display: block;font-weight: normal;font-size: 8pt;}';
        html += '.guia-title{width:100%;background-color:#5BC0DE;padding: 5px;}';
        html += '.guia-title-text-white{color:#FFFFFF;font-size:7pt;}';
        html += '.table-eventos{width:100%;border:0px;}';
        html += '.table-eventos tr td{align:left;border:0px;padding:8px;vertical-align:top;font-size:8pt;}';
        html += '.td{font-size:8pt;}';
        html += '.td-date-width{width:150px}';
        html += '.text{font-size:8pt;}';
        html += '</style>';

        // Encabezado.
        html += '<div class="header">';
        html +=   '<img class="escudo" src="data:image/png;base64,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"/>';
        html +=   '<span class="institucion">LEGISLATURA DE JUJUY</span>';
        html +=   '<span class="fecha">San Salvador de Jujuy, '+this.evento.date.dia+' de '+this.monthToString(this.evento.date.mes)+'  de '+this.evento.date.anio+' </span>';
        html +=   '<h3 class="ceremonial">Ceremonial y Protocolo</h3>';
        html += '</div>';
        html += '<div></div>';

        // Eventos.
        html += '<div class="guia-title">';
        html +=     '<span class="guia-title-text-white">GUIA DE ACTIVIDADES</span>';
        html += '</div>'

        for(let i = 0; i<this.eventos.length;i++){
            html += '<table class="table-common table-eventos">';
            html +=    '<tr>';
            html +=     '<td class="td td-date-width">';
            html +=         '<strong class="text">Dia:</strong> '+this.eventos[i].date.dia+' de '+this.monthToString(this.eventos[i].date.mes)+' de '+this.eventos[i].date.anio;
            html +=         '<br/>';
            html +=         '<strong class="text">Hora:</strong> '+this.eventos[i].date.hora+':'+this.eventos[i].date.minutos;
            html +=     '</td>';
            html +=     '<td class="td">';
            html +=         '<strong><u class="text">'+this.eventos[i].lugar.name+'</u></strong>';
            html +=         '<p class="text">'+this.eventos[i].description+'</p>';
            html +=         '<p class="text"><strong class="text">Invita:</strong>'+this.eventos[i].invites+'</p>';
            html +=     '</td>';
            html +=    '</tr>';
            html += '</table>';
        }

        // Impresión en pdf.
        let url = '/impresora-pdf';
        let xhr = new XMLHttpRequest();
        xhr.open('POST',url,true);
        xhr.onreadystatechange = ()=>{
            if (xhr.readyState == 4 && xhr.status == 200) {
                var href = document.createElement('a');
                var filename = 'guia_actividades_'+this.evento.date.dia+'-'+this.evento.date.mes+'-'+this.evento.date.anio+'.pdf';
                href.href = 'data:application/pdf;base64,' + xhr.responseText;
                href.style.display = 'none';
                href.download = filename;
                document.body.appendChild(href);
                href.click();
            }
        };
        xhr.send(html);
      });
  };

  /**
   * @method : httpDeleteEvento().
   */
  private httpDeleteEvento = () => {
    this
      .session
      .autorize(()=>{
        let url = '/rest/ful/webapps/protocolo/guia/index.php/evento/' + this.eventos[this.eventoIndex].uriname;
        this
          .http
          .delete<JsonResponse>(url)
          .subscribe((json)=>{
            if(json.result===true){
              this.alertEvento.type = "alert-success";
              this.alertEvento.text = "El evento se elimino en forma correcta.";
              setTimeout(this.resetOff,1500);
            }
          },(e)=>{
            this.alertEvento.type = "alert-danger";
            this.alertEvento.text = "No se puede conectar con el servidor.";
          });
      });
  };

  /**
   * @method : httpPutEventoActivar().
   */
  private httpPutEventoActivar = () => {
    this
      .session
      .autorize(()=>{
        let url = '/rest/ful/webapps/protocolo/guia/index.php/evento/' + this.eventos[this.eventoIndex].uriname + '/activar';
        this
          .http
          .put<JsonResponse>(url,null)
          .subscribe((json)=>{
            if(json.result===true) setTimeout(this.resetOff,1500);            
          },(e)=>{ console.log(e); });
      });
  };

  /**
   * @method : httpPutEventoInActivar().
   */
  private httpPutEventoInActivar = () => {
    this
      .session
      .autorize(()=>{
        let url = '/rest/ful/webapps/protocolo/guia/index.php/evento/' + this.eventos[this.eventoIndex].uriname + '/inactivar';
        this
          .http
          .put<JsonResponse>(url,null)
          .subscribe((json)=>{
            if(json.result===true) setTimeout(this.resetOff,1500);            
          },(e)=>{ console.log(e); });
      });
  };

  /**
   * @method : httpGetLugares().
   */
  private httpGetLugares = () => {
    this
      .session
      .autorize(()=>{
        let url = '/rest/ful/webapps/protocolo/guia/index.php/lugares';
        this
          .http
          .get<JsonResponse>(url)
          .subscribe((json)=>{if(json.result===true)this.lugares = json.rows;});
      });
  };

  /**
   * @method : httpPostLugar().
   */
  private httpPostLugar = () => {
    this
      .session
      .autorize(()=>{
        let url = '/rest/ful/webapps/protocolo/guia/index.php/lugar';
        this.lugar.name = (this.lugar.name.match(new RegExp('[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]{1,120}','g'))).join().replace(/,/g,'');
        this.lugar.uriname = this.lugar.name.toLowerCase().replace(/ /g,'-');
        this.lugar.description = (this.lugar.description.match(new RegExp('[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ.;,-]{1,120}','g'))).join().replace(/,/g,'');
        this
          .http
          .post<JsonResponse>(url,this.lugar)
          .subscribe((json)=>{
            if(json.result===true){
              this.alertEvento.type  = 'alert-success';
              this.alertEvento.text  = 'El lugar se guardó en forma correcta.';
              this.alertLugares.type = 'alert-success';
              this.alertLugares.text = 'El lugar se guardó en forma correcta.';
              this.lugares.push(this.lugar);
              this.evento.lugar.uriname=this.lugares[this.lugares.length -1].uriname;
              this.modalRef.hide();
            }
            else{
              this.alertLugares.type = 'alert-danger';
              this.alertLugares.text = 'El lugar no pudo ser guardado.';
            }
          },(e)=>{
            this.alertLugares.type = 'alert-danger';
            this.alertLugares.text = 'No se pudo conectar con el servidor.';
          });
      });
  };

  /**
   * @method : httpDeleteLugar().
   */
  private httpDeleteLugar = () => {
    this
      .session
      .autorize(()=>{
        let url = '/rest/ful/webapps/protocolo/guia/index.php/lugar/' + this.evento.lugar.uriname;
        this
          .http
          .delete<JsonResponse>(url)
          .subscribe((json)=>{
            if(json.result===true){
              this.alertEvento.type  = 'alert-success';
              this.alertEvento.text  = 'El lugar se ha eliminado en forma correcta.';
              this.httpGetLugares();
            }
          },(e)=>{
            this.alertEvento.type = 'alert-danger';
            this.alertEvento.text = 'No se pudo conectar con el servidor.';
          });
          this.evento.lugar.uriname=this.lugares[1].uriname;
          this.modalRef.hide();
    });
  };
  
  /**
   * @method : httpPostFotografias().
   */
  private httpPostFotografias = () => {
    let url = '/rest/ful/webapps/protocolo/guia/index.php/evento/' + this.evento.uriname + '/fotografias';
    let fotografias = new Array();
    for(let i in this.evento.fotografias) if(this.evento.fotografias[i].file.match('data:image/jpeg;base64,')) fotografias.push(this.evento.fotografias[i]);
    this
      .http
      .post<JsonResponse>(url,fotografias)
      .subscribe((json)=>{
        if(json.result===true) this.httpGetEventos();
      },(e)=>{
        console.log(e);
      });
  };

  /**
   * @method : httpDeleteFotografia().
   */
  private httpDeleteFotografia = () => {
    let url = '/rest/ful/webapps/protocolo/guia/index.php/evento/';
    url += this.eventos[this.fotografiaD.indexEvento].uriname;
    url += '/fotografia/';
    url += this.eventos[this.fotografiaD.indexEvento].fotografias[this.fotografiaD.indexFotografia].uriname;
    url += '/';
    url += this.eventos[this.fotografiaD.indexEvento].fotografias[this.fotografiaD.indexFotografia].file;
    this
      .http
      .delete<JsonResponse>(url)
      .subscribe((json)=>{
        if(json.result===true){
          this.alertFotografia.type = 'alert-success';
          this.alertFotografia.text = 'La fotografía se ha eliminado en forma correcta.';
          setTimeout(this.resetOff,1500);
        }
      },(e)=>{
        this.alertFotografia.type = 'alert-danger';
        this.alertFotografia.text = 'La fotografía no se ha eliminado.';
        console.log(e);
      });
  };

  /**
   * @method : resetDate().
   */
  private resetDate = () => {
    this.evento.date.dia     = this.d.getDate().toString();
    this.evento.date.mes     = (this.d.getMonth() +1).toString();
    this.evento.date.anio    = this.d.getFullYear().toString();
    this.evento.date.hora    = this.d.getHours().toString();
    this.evento.date.minutos = this.d.getMinutes().toString();
    if(this.evento.date.dia.length===1) this.evento.date.dia = '0' +this.evento.date.dia;
    if(this.evento.date.mes.length===1) this.evento.date.mes = '0' +this.evento.date.mes;
    if(this.evento.date.hora.length===1) this.evento.date.hora = '0' +this.evento.date.hora;
    if(this.evento.date.minutos.length===1) this.evento.date.minutos = '0' +this.evento.date.minutos;
  }

  /**
   * @method : resetOn().
   */
  private resetOn = () => {
    this.evento  = {
      lugar:{
        name:'',
        uriname:'',
        description:''
      },
      uriname:'',
      name:'',
      description:'',
      invites:'',
      date:{
        dia:'',
        mes:'',
        anio:'',
        hora:'',
        minutos:''
      },
      status:'INACTIVO',
      fotografias:new Array()
    };
    this.lugar       = {
      name:'',
      uriname:'',
      description:''
    };
    this.fotografiaD = {
      indexEvento: 0,
      indexFotografia : 0,
      file: null
    };
    this.cssLugarA   = 'show';
    this.cssLugarB   = 'hide';
    this.cssNuevo    = 'show';
    this.cssBtnNuevo = 'hide';
    this.editMode    = false;
    this.resetAlerts();
    this.resetDate();
  };

  /**
   * @method : resetOff().
   */
  private resetOff = () => {
    this.httpGetEventos();
    this.httpGetLugares();
    this.cssLugarA   = 'show';
    this.cssLugarB   = 'hide';
    this.cssNuevo    = 'hide';
    this.cssBtnNuevo = 'show';
    this.editMode    = false;
    this.modalRef.hide();
  };

  /**
   * @method : resetAlerts().
   */
  public resetAlerts = () => {
    this.alertEvento.type     = 'alert-info';
    this.alertEvento.text     = 'Complete el formulario.';
    this.alertLugares.type    = 'alert-info';
    this.alertLugares.text    = 'Complete el formulario.';
    this.alertFotografia.type = 'alert-info';
    this.alertFotografia.text = 'Complete el formulario.';
  };


  /**
   * @mthod : viewChangeLugarA().
   */
  public viewChangeLugarA = () => {
    if(this.evento.lugar.uriname==='------'){
      this.evento.name = '';
      this.cssLugarA = 'hide';
      this.cssLugarB = 'show';
    }
  }

  /**
   * @method : viewChangeLugarB().
   */
  public viewChangeLugarB = () => {
    if(this.evento.name===''){
      this.evento.lugar.uriname=this.lugares[1].uriname;
      this.evento.name = Date.now().toString();
      this.cssLugarA = 'show';
      this.cssLugarB = 'hide';
    }
  };

  /**
   * @method : viewLugarMas().
   */
  public viewLugarMas = (dialog : TemplateRef<any>) => {
    this.lugar.name='';
    this.lugar.uriname='';
    this.lugar.description='';
    this.resetAlerts();
    this.modalRef = this.modalService.show(dialog);
  };

  /**
   * @method : viewLugarMasCancelar().
   */
  public viewLugarMasCancelar = () => {
    this.modalRef.hide();
  };

  /**
   * @method : viewLugarMasAceptar().
   */
  public viewLugarMasAceptar = () => {
    this.httpPostLugar();
  };

  /**
   * @method : viewLugarMenos().
   */
  public viewLugarMenos = (dialog : TemplateRef<any>) => {
    this.resetAlerts();
    this.modalRef = this.modalService.show(dialog);
  };

  /**
   * @method : viewLugarMenosCancelar();
   */
  public viewLugarMenosCancelar = () => {
    this.modalRef.hide();
  };
  
  /**
   * @method : viewLugarMenosAceptar();
   */
  public viewLugarMenosAceptar = () => {
    this.httpDeleteLugar();
  };

  /**
   * @method : viewDialogoFotografiasMas().
   */
  public viewDialogoFotografiasMas = (i) =>{
    this.eventoIndex = i;
    this.evento = this.eventos[this.eventoIndex];

    let inputFile = document.createElement('input');
    inputFile.type     = 'file';
    inputFile.lang     = 'ES';
    inputFile.accept   = "image/jpeg, image/jpg";
    inputFile.multiple = true;
    inputFile.click();
    inputFile.onchange = () => {
      if(inputFile.files.length >= 1){
        for(let i = 0; i < inputFile.files.length; i++){
          let file = inputFile.files[i];
          let type = file.type;
          if (type.toString().substring(0, 5) === 'image') {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let img = new Image();
                img.src = reader.result;
                img.onload = () => {
                  let canvas    = document.createElement('canvas');
                  canvas.width = 500;

                  let percht = (500*100) / img.width;
                  let height = (percht*img.height)/100;
                  canvas.height = height;

                  let context = canvas.getContext('2d');
                  context.drawImage(img, 0, 0, canvas.width, canvas.height);
                                      
                  let dataURL = canvas.toDataURL('image/jpeg',0.9);

                  this.evento.fotografias.push({
                    uriname:Date.now().toString(),
                    file:dataURL,
                    mime:'image/jpeg'
                  });

                  if(inputFile.files.length===this.evento.fotografias.length) this.httpPostFotografias();

                };
            };
          }
        }
      }
    };
  };

  /**
   * @method : viewDialogoFotografiasMenos().
   * @param  : dialog : TemplateRef<any>.
   * @param  : indexEvento : number.
   * @param  : indexFotografia : number
   */
  public viewDialogoFotografiasMenos = (dialog : TemplateRef<any>, indexEvento:number,indexFotografia:number) => {
    this.resetAlerts();
    this.fotografiaD.indexEvento     = indexEvento;
    this.fotografiaD.indexFotografia = indexFotografia;
    this.fotografiaD.file            = this.eventos[indexEvento].fotografias[indexFotografia].file;
    this.modalRef = this.modalService.show(dialog);
  };

  /**
 * @method : viewDialogoFotografiasMenosCancelar().
 */
  public viewDialogoFotografiasMenosCancelar = () => {
    this.modalRef.hide();
  };

  /**
   * @method : viewDialogoFotografiasMenosAceptar().
   */
  public viewDialogoFotografiasMenosAceptar = () => {
    this.httpDeleteFotografia();
  };

  /**
   * @method : viewDialogoEventoEliminar().
   * @param  : i : number.
   * @param  : dialog : TemplateRef<any>.
   */
  public viewDialogoEventoEliminar = (dialog : TemplateRef<any>, i : number) => {
    this.eventoIndex = i;
    this.resetAlerts();
    this.modalRef = this.modalService.show(dialog);
  };

  /**
   * @method : viewDialogoEventoEliminarCancelar().
   */
  public viewDialogoEventoEliminarCancelar = () => {
    this.modalRef.hide();
  };

  /**
   * @method : viewEliminar().
   */
  public viewDialogoEventoEliminarAceptar = () => {
    this.httpDeleteEvento();
  };

  /**
   * @method : viewDialogoEventoModificar().
   */
  public viewDialogoEventoModificar = (dialog : TemplateRef<any>, i) => {
    this.eventoIndex = i;
    this.resetAlerts();
    this.modalRef = this.modalService.show(dialog);
  };

  /**
   * @method : viewDialogoEventoModificarCancelar().
   */
  public viewDialogoEventoModificarCancelar = () => {
    this.modalRef.hide();
  };

  /**
  * @method : viewDialogoEventoModificarAceptar().
  */
  public viewDialogoEventoModificarAceptar = () => {
    this.resetOn();
    this.editMode = true;
    this.evento = this.eventos[this.eventoIndex];
    if(this.evento.lugar.uriname==='------'){
      this.cssLugarA = 'hide';
      this.cssLugarB = 'show';
    }
    else{
      this.cssLugarA = 'show';
      this.cssLugarB = 'hide';
    }
    this.modalRef.hide();
  };
  /**
   * @method : viewCancelar().
   */
  public viewCancelar  = () => {
    this.resetOff();
    this.modalRef.hide();
  };

  /**
   * @method : viewGuardar().
   */
  public viewGuardar = () => {
    this.httpPostAndPutEvento();
  };

  /**
   * @method : viewDescargar().
   */
  public viewDescargar = () => {
    this.httpPostEventoPrint();
  };

  /**
   * @method : viewNuevo(modal:TemplateRef<any>).
   * @param  : modal : TemplateRef<any>.
   */
  public viewNuevo = (modal : TemplateRef<any>) => {
    this.resetOn();
    this.evento.name = Date.now().toString();
    this.evento.lugar.uriname=this.lugares[1].uriname;
    this.modalRef = this.modalService.show(modal);
  };

  /**
 * @method : viewDialogEventoConfirmChangeStatus().
 * @param  : dialog : TemplateRef<any>.
 * @param  : i : number.
 */
  public viewDialogEventoConfirmChangeStatus = (dialog: TemplateRef<any>,i : number) => {
    this.eventoIndex = i;
    this.modalRef = this.modalService.show(dialog);
  };
  
  /**
   * @method : viewDialogEventoConfirmChangeStatusCerrar().
   */
  public viewDialogEventoConfirmChangeStatusCerrar = () => {
    this.modalRef.hide();
  };

  /**
   * @method : viewDialogEventoConfirmChangeStatusInactive().
   */
  public viewDialogEventoConfirmChangeStatusInactive = () => {
    this.httpPutEventoInActivar();
  };

  /**
   * @method : viewDialogEventoConfirmChangeStatusActive().
   */
  public viewDialogEventoConfirmChangeStatusActive = () => {
    this.httpPutEventoActivar();
  };

  /**
   * @method : monthToString().
   */
  public monthToString = (month:string)=>{
    let $return = '';
    for(let i = 0; i < this.meses.length; i++) if(this.meses[i].value===month) $return = this.meses[i].name;
    return $return;
  };
}
