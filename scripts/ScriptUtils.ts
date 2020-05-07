import * as readline from "readline";
import trim from "lodash/trim";
import isString from "lodash/isString";
import {spawn} from "child_process";
import path from "path";
import node_modules_path from "node_modules-path";
import recursive from "recursive-readdir";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export interface ScriptOption {
    name?: string;
    value: any;
}

export class ScriptUtils {

    static DEFAULT_PROMPT_SUFFIX = " : ";

    static question = async (question: string, defaultValue?: string): Promise<string> => {
        const answer = await (new Promise<string>((resolve) => {

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

    static choose = async (question: string, options: ScriptOption[] | string[]): Promise<ScriptOption> => {

        let optionsArray:ScriptOption[] = options as ScriptOption[];

        if(isString(options[0]))
        {
            optionsArray = (options as string[]).map<ScriptOption>(optionString => ({value:optionString}));
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

    static confirm = async (message: string, defaultResponse?: boolean): Promise<boolean> => {
        const answer = trim(await ScriptUtils.question(message + " (y/n)")).toLowerCase();

        if (!answer || answer === "") {
            if (defaultResponse === undefined || defaultResponse === null) {
                return ScriptUtils.confirm(message, defaultResponse);
            } else {
                return defaultResponse;
            }
        }

        return answer.substr(0, 1) === "y" || answer === "true" || answer === "1";
    };

    static async start(startFunction: () => Promise<any>, loop: boolean = false) {
        do {
            await startFunction();

            if (loop) {
                loop = await ScriptUtils.confirm("\n\nDo you want to do this again?", false);
            }
        }
        while (loop);
        ScriptUtils.end();
    }

    static async executeCommand(command:string, args:string[], outputToConsole:boolean = true, cwd:string = "./"):Promise<number>
    {
        const newCWD = path.resolve(process.cwd(), cwd);

        const envVars = {
            ...process.env
        };

        envVars.PATH += `:${node_modules_path()}/.bin`;

        return new Promise((resolve, reject) => {
            const commandProcess = spawn(command, args, {
                stdio: "inherit",
                cwd: newCWD,
                env: envVars
            });
            commandProcess.on('error', reject);
            commandProcess.on('close', resolve);
        });
    }

    static async recursiveReadDir(rootPath:string):Promise<string[]>
    {
        return recursive(rootPath);
    }

    static end() {
        rl.close();
        process.exit(0);
    }
}