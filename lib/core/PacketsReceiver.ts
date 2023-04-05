import Packet from "../crypto/Packet";

export interface PacketsReceiver {
  dispatch(packet: Packet): void
}