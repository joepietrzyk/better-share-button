/**
 * Determines if a Node is an Element
 * @param node the Node to determine if it's an Element
 * @returns true if the node is an Element
 */
export function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

/**
 * Checks if this is currently running in a browser context
 * @returns true if it is currently executing in a browser context
 */
export function isBrowser(): boolean {
  return process.env.NODE_ENV !== 'test';
}
