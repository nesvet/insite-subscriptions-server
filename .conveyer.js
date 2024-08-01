import path from "node:path";
import { Conveyer, ESBuild } from "@nesvet/conveyer";


const distDir = "dist";


new Conveyer([
	
	new ESBuild({
		entryPoints: [ "src/index.ts" ],
		outfile: path.resolve(distDir, "index.js"),
		external: true,
		platform: "node",
		format: "esm",
		sourcemap: true,
		target: "node20"
	})
	
], {
	initialCleanup: distDir
});
