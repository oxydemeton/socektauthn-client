import {resolve} from "path"
/** @type {import('vite').UserConfig} */
export default {
    build: {
        lib: {
            name: "socketauth",
            entry: resolve(__dirname, "./src/mod.ts"),
            fileName: "mod",
            formats: ["es"]
        }
    }
}