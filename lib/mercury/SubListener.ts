import MercuryClient from "./MercuryClient";

export type SubListener = (resp: typeof MercuryClient.Response.prototype) => void;