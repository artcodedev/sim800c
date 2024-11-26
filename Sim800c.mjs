


import { ConnectorSIM800C } from "./ConnectorSIM800C.mjs";
import punycode from 'punycode';


export class Sim800c {

    constructor(path, port) {
        this.connectorSIM800C = new ConnectorSIM800C(path, port);
    }

    /*
    *** Open port SIM800c
    */
    async openPortSim800c() {
        await this.connectorSIM800C.open();
    }

    /*
    *** Close port SIM800c
    */
    async closePortSim800c() {
        await this.connectorSIM800C.close();
    }

    /*
    *** privare method
    *** decode UCS2 to UTF
    */
    async #decodeUCS2(message) {

        try {
            const txt_codes = message.match(/.{1,4}/g);
            let codes = [];
            txt_codes.forEach((i) => codes.push(parseInt(i, 16)));
            return punycode.ucs2.encode(codes);
        }
        catch {
            return message
        }
    }

    /*
    *** privare method
    */
    async #getAllMessages(number = false) {

        await this.connectorSIM800C.sendCommand("AT+CMGF=1");

        const response = [];

        const allMessage = await this.connectorSIM800C.sendCommand("AT+CMGL=\"ALL\"");

        const massMessage = allMessage.split("\r\n\r\n");

        for (let i = 0; i < massMessage.length; i++) {

            const spliMassMessage = massMessage[i].split(",");

            if (spliMassMessage.length >= 5) {
                const phone = spliMassMessage[2].replaceAll('"', '')

                const message = {
                    id: (i + 1).toString(),
                    phone: phone,
                    date: spliMassMessage[4],
                    message: await this.#decodeUCS2(spliMassMessage[5].split('\r\n')[1])
                }

                if (number) {
                    if (number === phone) {
                        response.push(message);
                    }

                } else {
                    response.push(message);
                }
            }

        }

        return response;
    }

    /*
    *** privare method
    */
    async #getNewMessage(number = false) {
        await this.connectorSIM800C.sendCommand("AT+CMGF=1");

        const unread = "REC UNREAD", response = [];

        const allMessage = await this.connectorSIM800C.sendCommand("AT+CMGL=\"ALL\"");

        if (allMessage.includes(unread)) {

            const massMessage = allMessage.split("\r\n\r\n");

            for (let i = 0; i < massMessage.length; i++) {

                const spliMassMessage = massMessage[i].split(",");

                if (spliMassMessage.length >= 5) {
                    const phone = spliMassMessage[2].replaceAll('"', '')

                    const message = {
                        type: unread,
                        phone: phone,
                        date: spliMassMessage[4],
                        message: await this.#decodeUCS2(spliMassMessage[5].split('\r\n')[1])
                    }

                    if (spliMassMessage[1] === unread) {
                        if (number) {
                            if (number === phone) {
                                response.push(message);
                            }

                        } else {
                            response.push(message);
                        }
                    }
                }

            }

        }

        return response;
    }

    /*
    *** Get all messages if {number == null} or get all messages use {number} 
    */
    async getAllMessages(number = false) {

        return await this.#getAllMessages(number);

    }

    /*
    *** Sort the entire message using the sort number
    */
    async getLastMessage(number) {

        if (!number) return []

        const message = await this.#getAllMessages(number);

        return message[message.length - 1];
    }

    /*
    *** Get last new message use number or not
    */
    async getNewLastMessage(number = false) {

        const getNewMessage = await this.#getNewMessage(number);

        return getNewMessage.length ? getNewMessage.reverse()[getNewMessage.length - 1] : [];

    }

    /*
    *** Get all new message use number or not
    */
    async getNewAllMessage(number = false) {
        return await this.#getNewMessage(number);
    }

    /*
    *** Delete all message
    */
    async deleteAllMessage() {

        await this.connectorSIM800C.sendCommand("AT+CMGF=1");

        const deleteAllMessage = await this.connectorSIM800C.sendCommand("AT+CMGDA=\"DEL ALL\"");

        return deleteAllMessage;

    }

}
