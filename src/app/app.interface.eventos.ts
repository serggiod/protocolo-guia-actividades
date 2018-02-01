import { Fecha } from './app.interface.fecha';
import { Lugares } from './app.interface.lugares';
import { Fotografia } from './app.interface.fotografia';

export interface Eventos {
    lugar       : Lugares,
    uriname     : string,
    name        : string,
    description : string,
    invites     : string,
    date        : Fecha,
    status      : string,
    fotografias : Array<Fotografia>
}