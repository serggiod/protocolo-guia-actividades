// ng-modules.
import { NgModule }          from '@angular/core';
import { BrowserModule }     from '@angular/platform-browser';
import { HttpClientModule }  from '@angular/common/http';
import { QuillEditorModule } from 'ngx-quill-editor';
import { FormsModule }       from '@angular/forms';

// ngx-bootstrap
import { PopoverModule }     from 'ngx-bootstrap';
import { CarouselModule }    from 'ngx-bootstrap';
import { ModalModule }       from 'ngx-bootstrap';

// ng-app-components
import { AppComponent }     from './app.component';
import { HeaderComponent }  from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    QuillEditorModule,
    FormsModule,
    PopoverModule.forRoot(),
    CarouselModule.forRoot(),
    ModalModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
