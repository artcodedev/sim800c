


import { Sim800c } from "./Sim800c.mjs";



/*
*** linux: sudo node example.mjs
*** Windows: node example.mjs
*** MacOS: sudo? node example.mjs
*/

const sim800c = new Sim800c('/dev/ttyUSB0', 9600);

await sim800c.openPortSim800c();

let allMessage = await sim800c.getAllMessages();

await sim800c.closePortSim800c();
