﻿import Toastify from "toastify-js";

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

/**
 * Displays a "Copied to clipboard" toast at the specified cursor position (x, y).
 * If no existing toast is found, a new one is created and positioned using `position: fixed`.
 * @param x - The horizontal position where the toast will appear.
 * @param y - The vertical position where the toast will appear.
 * @example
 * // Show a toast at coordinates (100, 200)
 * clipboardToast(100, 200);
 */
export function clipboardToast(x: number, y: number): void {
  const lastToast = document.querySelector('.toastify');
  if (!lastToast) {
    Toastify({
      text: "Copied to clipboard",
      duration: 1000,
      position: 'left',
      gravity: 'top',
      close: false,
      style: {
        background: "#333",
        color: "white",
        borderRadius: "5px",
        padding: "10px",
        zIndex: "1000",
      },
    }).showToast();

    const lastToast = document.querySelector('.toastify') as HTMLElement;
    if (lastToast) {
      lastToast.style.position = "fixed";
      lastToast.style.left = `${x}px`;
      lastToast.style.top = `${y}px`;
      lastToast.setAttribute('tabindex', '-1');
      document.body.appendChild(lastToast);
    }
  }
}

/**
 * Recursively attaches mutation observers to the given element and its children.
 * Observes for specific key elements (such as the share buttons or post-sharing containers),
 * and disconnects when the button is found.
 * @param element - The element to attach observers to.
 * @param targetClassname
 * @param callback
 */
export function attachObserversToSubtree(element: Element, targetClassname: string, 
  callback: (element: Element) => void): void {
  if (!isElement(element)) {
    return;
  }

  if (element.classList.contains(targetClassname)) {
    callback(element);
    return;
  }

  const nestedObserver = new MutationObserver((nestedMutationsList: MutationRecord[]) => {
    nestedMutationsList.forEach((nestedMutation: MutationRecord) => {
      nestedMutation.addedNodes.forEach((nestedElement: Node) => {
        if (isElement(nestedElement)) {
          attachObserversToSubtree(nestedElement, targetClassname, callback);
        }
      });
    });
  });

  nestedObserver.observe(element, {
    childList: true,
    subtree: true
  });

  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    attachObserversToSubtree(children[i], targetClassname, callback);
  }
}
