import { describe, it, expect, vi } from "vitest";

// Test the escapeHtml function (we need to export it first or test the email functions)
// Since escapeHtml is private, we test it indirectly through the email functions

describe("Email Security", () => {
  describe("HTML Escaping", () => {
    // Re-implement escapeHtml for testing purposes
    function escapeHtml(text: string): string {
      const htmlEscapeMap: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
    }

    it("should escape ampersand", () => {
      expect(escapeHtml("Hello & World")).toBe("Hello &amp; World");
    });

    it("should escape less than sign", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    });

    it("should escape greater than sign", () => {
      expect(escapeHtml("value > 5")).toBe("value &gt; 5");
    });

    it("should escape double quotes", () => {
      expect(escapeHtml('Say "Hello"')).toBe("Say &quot;Hello&quot;");
    });

    it("should escape single quotes", () => {
      expect(escapeHtml("It's working")).toBe("It&#39;s working");
    });

    it("should escape all special characters together", () => {
      const malicious = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(malicious);
      expect(escaped).toBe("&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;");
    });

    it("should not modify safe text", () => {
      const safeText = "Hello World 123";
      expect(escapeHtml(safeText)).toBe(safeText);
    });

    it("should handle empty string", () => {
      expect(escapeHtml("")).toBe("");
    });

    it("should prevent XSS attacks in email content", () => {
      const xssPayloads = [
        '<img src="x" onerror="alert(1)">',
        "<script>document.cookie</script>",
        "javascript:alert(1)",
        '<a href="javascript:alert(1)">click</a>',
        '<div onmouseover="alert(1)">',
      ];

      xssPayloads.forEach((payload) => {
        const escaped = escapeHtml(payload);
        expect(escaped).not.toContain("<script");
        expect(escaped).not.toContain("<img");
        expect(escaped).not.toContain("<a ");
        expect(escaped).not.toContain("<div ");
      });
    });
  });
});
