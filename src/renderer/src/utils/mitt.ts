import mitt, { Emitter } from 'mitt'
const emitter:Emitter<any> = (mitt as any)();
export default emitter
