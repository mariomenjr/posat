"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Exchange_models_1 = require("./src/models/Exchange.models");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const fills = new Exchange_models_1.FillArray();
fs_1.default.createReadStream(`./fills/fills.20211203.csv`)
    .pipe((0, csv_parser_1.default)({
    headers: [
        `portfolion`,
        `tradeId`,
        `product`,
        `side`,
        `createdAt`,
        `size`,
        `sizeUnit`,
        `price`,
        `fee`,
        `total`,
        `fiatUnit`,
    ],
}))
    .on(`data`, (fill) => {
    console.debug({ fill });
    return fills.push(fill);
})
    .on(`end`, () => console.debug({
    fills: fills.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
}));
