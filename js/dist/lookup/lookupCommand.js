"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupCommand = void 0;
var LookupCommand;
(function (LookupCommand) {
    LookupCommand[LookupCommand["ping"] = 0] = "ping";
    LookupCommand[LookupCommand["lookup"] = 1] = "lookup";
    LookupCommand[LookupCommand["loadGrid"] = 2] = "loadGrid";
    LookupCommand[LookupCommand["comprehensiveLookup"] = 3] = "comprehensiveLookup";
    LookupCommand[LookupCommand["getMetaData"] = 4] = "getMetaData";
})(LookupCommand = exports.LookupCommand || (exports.LookupCommand = {}));
