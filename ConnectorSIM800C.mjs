
import { SerialPort } from 'serialport'

export class ConnectorSIM800C {

    constructor(path, port) {
        this.options = {
            'path': path,
            'baudRate': port
        }
    }

    /*
    *** Open port SIM800C
    */
    async open() {
        return new Promise((resolve, reject) => {
            this.port = new SerialPort(this.options);

            this.port.open( err => {
                if (err) {
                    return new Error(err.message);
                }

                console.log("[+] ConnectorSIM800C port is opened");

            });

            this.port.on('open', () => resolve());
            this.port.on('error', err => reject(err));
        })
    }

    /*
    *** Send command to SIM800C
    */
    async sendCommand(command, terminator = '\r', timeout = 30000) {
        return new Promise((resolve, reject) => {

            let response = [], commandTimeout;

            let listener = (s) => {

                response.push(s.toString());

                const lines = response.join('').split('\r\n').filter(Boolean);
                const lastLine = (lines[lines.length - 1] || '').trim();

                if (lastLine === 'ERROR') {
                    clearTimeout(commandTimeout);
                    this.port.removeListener('data', listener);
                    reject(new Error('Command error'));
                    return;
                }

                if (lastLine === 'OK') {
                    clearTimeout(commandTimeout);
                    this.port.removeListener('data', listener);
                    resolve(response.join(''))
                }

            }

            this.port.write(`${command}${terminator}`);
            this.port.on('data', listener);

            commandTimeout = setTimeout(() => {
                this.port.removeListener('data', listener);
                reject(new Error(`Command timeout: ${command}`));
            }, timeout);

        });
    }

    /*
    *** Close port SIM800C
    */
    async close() {
        return new Promise((resolve, reject) => {
            this.port.close(err => err ? reject(new Error(err.message)) : resolve());
        });
    }

}
