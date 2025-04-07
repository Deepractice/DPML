import { Element } from '../../../src/types/node';
declare global {
    var gc: (() => void) | undefined;
}
declare module '../../../src/processor/processingContext' {
    interface ProcessingContext {
        idMap: Map<string, Element>;
    }
}
//# sourceMappingURL=memory-usage.test.d.ts.map