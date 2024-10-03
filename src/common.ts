import Toastify from 'toastify-js';
import icon from '../assets/icon.svg';

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
      text: 'Copied to clipboard',
      duration: 1000,
      position: 'left',
      gravity: 'top',
      close: false,
      style: {
        background: '#333',
        color: 'white',
        borderRadius: '5px',
        padding: '10px',
        zIndex: '1000',
        'font-family': 'inherit',
        cursor: 'default',
      },
    }).showToast();

    const lastToast = document.querySelector('.toastify') as HTMLElement;
    if (lastToast) {
      lastToast.style.position = 'fixed';
      lastToast.style.left = `${x}px`;
      lastToast.style.top = `${y}px`;
      lastToast.setAttribute('tabindex', '-1');
      document.body.appendChild(lastToast);
    }
  }
}

const iconDiv = document.createElement('div');
// eslint-disable-next-line no-unsanitized/property
iconDiv.innerHTML = icon;

const svgIcon = iconDiv.children[0]! as SVGElement;

/**
 * Gets the icon SVG and returns it as a `SVGElement`
 * @returns the icon SVG
 */
export function getSVGIcon(): SVGElement {
  return svgIcon.cloneNode(true) as SVGElement;
}

/**
 * Gets the icon SVG and gives us the dark mode version
 * @returns the dark mode SVG icon
 */
export function getSVGIconDark(): SVGElement {
  const darkSVG = svgIcon.cloneNode(true) as SVGElement;
  [...darkSVG.children].forEach(child => {
    child.setAttribute('stroke', 'white');
  });
  return darkSVG;
}
