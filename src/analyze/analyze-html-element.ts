import * as tsModule from "typescript";
import { Node, Program } from "typescript";
import { DEFAULT_FEATURE_COLLECTION_CACHE } from "./constants";
import { AnalyzerDeclarationVisitContext } from "./flavors/analyzer-flavor";
import { CustomElementFlavor } from "./flavors/custom-element/custom-element-flavor";
import { analyzeComponentDeclaration } from "./stages/analyze-declaration";
import { ComponentDeclaration } from "./types/component-declaration";

/**
 * This function only analyzes the HTMLElement declaration found in "lib.dom.d.ts" source file provided by Typescript.
 * @param program
 * @param ts
 */
export function analyzeHTMLElement(program: Program, ts: typeof tsModule = tsModule): ComponentDeclaration | undefined {
	const checker = program.getTypeChecker();

	const endsWithLibDom = "lib.dom.d.ts";

	const domLibSourceFile = program.getSourceFiles().find(sf => sf.fileName.endsWith(endsWithLibDom));
	if (domLibSourceFile == null) {
		return undefined;
		//throw new Error(`Couldn't find '${endsWith}'. Have you included the 'dom' lib in your tsconfig?`);
	}

	return visit(domLibSourceFile, {
		checker,
		ts,
		flavors: [new CustomElementFlavor()],
		config: {
			analyzeLibDom: true
		},
		cache: {
			featureCollection: DEFAULT_FEATURE_COLLECTION_CACHE,
			general: new Map()
		},
		getDefinition: () => {
			throw new Error("Definition not available");
		},
		getDeclaration: () => {
			throw new Error("Declaration not available");
		}
	});
}

function visit(node: Node, context: AnalyzerDeclarationVisitContext): ComponentDeclaration | undefined {
	if (context.ts.isInterfaceDeclaration(node) && node.name.text === "HTMLElement") {
		return analyzeComponentDeclaration([node], context);
	}

	return node.forEachChild(child => {
		return visit(child, context);
	});
}