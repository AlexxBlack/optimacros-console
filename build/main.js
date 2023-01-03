import readlineSync from 'readline-sync';
import { Curl } from 'node-libcurl';
import chalk from 'chalk';
const server = process.argv[2];
const curl = new Curl();
const terminate = curl.close.bind(curl);
let haltFlag = false;
function requestServer(query, method, payload) {
    console.log(chalk.blue(server + query));
    curl.setOpt(Curl.option.URL, server + query);
    curl.setOpt(Curl.option.CUSTOMREQUEST, method ? method.toUpperCase() : "GET");
    if (method === 'post' && payload !== undefined) {
        curl.setOpt(Curl.option.HTTPHEADER, ['Content-Type: application/json']);
        curl.setOpt(Curl.option.POSTFIELDS, payload);
    }
    return new Promise((resolve, reject) => {
        curl.on('end', (statusCode, data, headers) => {
            resolve({ statusCode, data });
        });
        curl.on('error', (e) => {
            terminate();
            reject(e);
        });
        curl.perform();
    });
}
function reply(response) {
    let color = 'green';
    if (!response.statusCode || !response.statusCode.toString().startsWith('2')) {
        color = 'red';
    }
    console.log(chalk[color](response.data));
}
do {
    let command = readlineSync.question('Enter the command (type "h" or "help" for list of all suitable commands): ');
    let commandParts = command.split(" ", 3);
    switch (commandParts[0]) {
        case "h":
        case "help":
            console.log(chalk.gray("You can use following commands:\n " +
                "'cars' - list of all cars from DB (unsorted)\n " +
                "'cars by <fieldname>' - list of all cars ordered by provided field \n " +
                "'car <id>' - gets all data about car with such id\n " +
                "'car delete <id>' - deletes car with such id\n " +
                "'car add' - starts interactive process of adding the car.\n " +
                "'e' or 'x' or 'exit' to terminate the program"));
            break;
        case "e":
        case "x":
        case "exit":
            haltFlag = true;
            break;
        case "cars": {
            let result;
            switch (commandParts[1]) {
                case 'by': {
                    result = await requestServer(`/cars/order-by-${commandParts[2]}`);
                    break;
                }
                case undefined:
                default:
                    {
                        result = await requestServer('/cars/');
                        break;
                    }
            }
            reply(result);
            break;
        }
        case "car": {
            let result;
            switch (commandParts[1]) {
                case "delete": {
                    if (commandParts[2]) {
                        result = await requestServer(`/car/${commandParts[2]}`, 'delete');
                        reply(result);
                    }
                    else {
                        console.log(chalk.red('Car id must be provided for this action'));
                    }
                    break;
                }
                case "add": {
                    let car = {
                        brand: '-',
                        name: '-',
                        year: 0,
                        price: 0,
                    };
                    for (let key of Object.keys(car)) {
                        let data = readlineSync.question(`Enter car's ${key}: `);
                        if (typeof car[key] == 'number') {
                            data = parseInt(data);
                        }
                        car[key] = data;
                    }
                    result = await requestServer('/car/', 'post', JSON.stringify({ car }));
                    reply(result);
                    break;
                }
                default: {
                    result = await requestServer(`/car/${commandParts[1]}`);
                    reply(result);
                    break;
                }
            }
            break;
        }
    }
} while (!haltFlag);
//# sourceMappingURL=main.js.map