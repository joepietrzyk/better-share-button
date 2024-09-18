import { describe, it, expect, vi } from 'vitest';
import { getPostURL } from './reddit';  // Adjust the import path to the location of your getPostURL function

// Helper function to mock DOM elements
function mockPostSharingLinkInput(value: string | null) {
    const mockElement = document.createElement('input');
    mockElement.className = 'post-sharing-link-input';
    if (value) {
        mockElement.setAttribute('value', value);
    }
    document.body.appendChild(mockElement);
}

describe('getPostURL', () => {
    // Clean up the DOM after each test
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should return the value of the input element without query parameters', () => {
        // Arrange
        mockPostSharingLinkInput('https://old.reddit.com/r/somepost?ref=some_query');

        // Act
        const result = getPostURL();

        // Assert
        expect(result).toBe('https://vxreddit.com/r/somepost');
    });

    it('should return the current window location if input element is not present', () => {
        // Arrange
        const mockLocation = 'https://old.reddit.com/r/someotherpost?ref=another_query';
        vi.stubGlobal('window', { location: { toString: () => mockLocation } });

        // Act
        const result = getPostURL();

        // Assert
        expect(result).toBe('https://vxreddit.com/r/someotherpost');
    });

    it('should use window location if input element does not have a value attribute', () => {
        // Arrange
        mockPostSharingLinkInput(null); // Input element exists but no value attribute
        const mockLocation = 'https://new.reddit.com/r/someotherpost';
        vi.stubGlobal('window', { location: { toString: () => mockLocation } });

        // Act
        const result = getPostURL();

        // Assert
        expect(result).toBe('https://vxreddit.com/r/someotherpost');
    });

    it('should replace "old.reddit" and "new.reddit" with "vxreddit"', () => {
        // Arrange
        const mockLocation = 'https://new.reddit.com/r/someotherpost';
        vi.stubGlobal('window', { location: { toString: () => mockLocation } });

        // Act
        const result = getPostURL();

        // Assert
        expect(result).toBe('https://vxreddit.com/r/someotherpost');
    });
});
