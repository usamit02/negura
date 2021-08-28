import { User, USER, Column, COLUMN,Marker,MARKER,Prop } from './class'

export interface State {
  user: User,
  users,
  columns: Array<Column>,
  marker:Marker,
  markers:Array<Marker>,
  prop:Prop,
  isServer:boolean,
  host:String,
}
export const initialState = {
  user: USER,
  users:[],
  columns: [COLUMN],
  marker:MARKER,
  markers:[MARKER],
  prop:null,
  isServer:null,
  host:"iotstay.web.app",
}