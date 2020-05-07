import {nanoid} from "nanoid";

export class Utils {
    static isServer()
    {
        return !Utils.isClient();
    }

    static isClient()
    {
        return (typeof window !== 'undefined');
    }
    
    static generateID(length?:number)
    {
        return nanoid(length);
    }
}