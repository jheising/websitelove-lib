export class Utils {
    static isServer()
    {
        return !Utils.isClient();
    }

    static isClient()
    {
        return (typeof window !== 'undefined');
    }
}