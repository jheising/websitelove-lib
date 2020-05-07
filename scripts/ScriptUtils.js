"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const trim_1 = __importDefault(require("lodash/trim"));
const isString_1 = __importDefault(require("lodash/isString"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const node_modules_path_1 = __importDefault(require("node_modules-path"));
const recursive_readdir_1 = __importDefault(require("recursive-readdir"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
class ScriptUtils {
    static async start(startFunction, loop = false) {
        do {
            await startFunction();
            if (loop) {
                loop = await ScriptUtils.confirm("\n\nDo you want to do this again?", false);
            }
        } while (loop);
        ScriptUtils.end();
    }
    static async executeCommand(command, args, outputToConsole = true, cwd = "./") {
        const newCWD = path_1.default.resolve(process.cwd(), cwd);
        const envVars = Object.assign({}, process.env);
        envVars.PATH += `:${node_modules_path_1.default()}/.bin`;
        return new Promise((resolve, reject) => {
            const commandProcess = child_process_1.spawn(command, args, {
                stdio: "inherit",
                cwd: newCWD,
                env: envVars
            });
            commandProcess.on('error', reject);
            commandProcess.on('close', resolve);
        });
    }
    static async recursiveReadDir(rootPath) {
        return recursive_readdir_1.default(rootPath);
    }
    static end() {
        rl.close();
        process.exit(0);
    }
}
exports.ScriptUtils = ScriptUtils;
ScriptUtils.DEFAULT_PROMPT_SUFFIX = " : ";
ScriptUtils.question = async (question, defaultValue) => {
    const answer = await (new Promise((resolve) => {
        question = question + ScriptUtils.DEFAULT_PROMPT_SUFFIX;
        if (defaultValue) {
            question += ` (${defaultValue})`;
        }
        rl.question(question, resolve);
    }));
    if (!answer || answer === "") {
        if (defaultValue) {
            return defaultValue;
        }
    }
    return answer;
};
ScriptUtils.choose = async (question, options) => {
    let optionsArray = options;
    if (isString_1.default(options[0])) {
        optionsArray = options.map(optionString => ({ value: optionString }));
    }
    const optionsQuestion = question + "\n\n"
        + optionsArray.map((option, index) => `(${index + 1}) ${option.name || option.value.toString()}`)
            .join("\n") + `\n\n(1-${options.length})`;
    const answer = Number(await ScriptUtils.question(optionsQuestion));
    if (isNaN(answer) || answer <= 0 || answer > options.length) {
        return ScriptUtils.choose(question, options);
    }
    return optionsArray[answer - 1];
};
ScriptUtils.confirm = async (message, defaultResponse) => {
    const answer = trim_1.default(await ScriptUtils.question(message + " (y/n)")).toLowerCase();
    if (!answer || answer === "") {
        if (defaultResponse === undefined || defaultResponse === null) {
            return ScriptUtils.confirm(message, defaultResponse);
        }
        else {
            return defaultResponse;
        }
    }
    return answer.substr(0, 1) === "y" || answer === "true" || answer === "1";
};
//# sourceMappingURL=ScriptUtils.js.map