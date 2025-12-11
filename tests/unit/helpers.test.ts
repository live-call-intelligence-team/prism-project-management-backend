import { getPaginationMeta, generateIssueKey, extractMentions, slugify } from '../../src/utils/helpers';

describe('Helper Functions', () => {
    describe('getPaginationMeta', () => {
        it('should calculate pagination metadata correctly', () => {
            const result = getPaginationMeta(1, 10, 50);

            expect(result).toEqual({
                page: 1,
                limit: 10,
                totalPages: 5,
                totalItems: 50,
                hasNextPage: true,
                hasPrevPage: false,
            });
        });

        it('should handle last page correctly', () => {
            const result = getPaginationMeta(5, 10, 50);

            expect(result.hasNextPage).toBe(false);
            expect(result.hasPrevPage).toBe(true);
        });

        it('should handle single page', () => {
            const result = getPaginationMeta(1, 10, 5);

            expect(result.totalPages).toBe(1);
            expect(result.hasNextPage).toBe(false);
            expect(result.hasPrevPage).toBe(false);
        });
    });

    describe('generateIssueKey', () => {
        it('should generate correct issue key', () => {
            const key = generateIssueKey('PROJ', 123);
            expect(key).toBe('PROJ-123');
        });

        it('should handle single digit numbers', () => {
            const key = generateIssueKey('TEST', 1);
            expect(key).toBe('TEST-1');
        });
    });

    describe('extractMentions', () => {
        it('should extract mentions from text', () => {
            const text = 'Hey @john, can you review this? cc @alice';
            const mentions = extractMentions(text);

            expect(mentions).toContain('john');
            expect(mentions).toContain('alice');
            expect(mentions).toHaveLength(2);
        });

        it('should return empty array when no mentions', () => {
            const text = 'No mentions here';
            const mentions = extractMentions(text);

            expect(mentions).toEqual([]);
        });

        it('should handle multiple mentions of same user', () => {
            const text = '@john @john @alice';
            const mentions = extractMentions(text);

            expect(mentions).toContain('john');
            expect(mentions).toContain('alice');
        });
    });

    describe('slugify', () => {
        it('should convert text to slug', () => {
            const slug = slugify('Hello World');
            expect(slug).toBe('hello-world');
        });

        it('should handle special characters', () => {
            const slug = slugify('Hello, World! 123');
            expect(slug).toBe('hello-world-123');
        });

        it('should handle multiple spaces', () => {
            const slug = slugify('Hello    World');
            expect(slug).toBe('hello-world');
        });
    });
});
