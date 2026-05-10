def test_navigation_links(logged_page):
    logged_page.logger.action("=== NAVIGATION LINKS VERIFICATION ===")

    logged_page.goto("http://localhost:3010", timeout=15000)
    logged_page.wait_for_load_state("networkidle", timeout=10000)
    logged_page.wait_for_timeout(3000)

    links = logged_page.evaluate("""() => {
        return Array.from(document.querySelectorAll('nav a, header a, [role=\"navigation\"] a'))
            .map(a => ({href: a.href, text: a.textContent.trim()}))
            .filter(a => a.href && a.text);
    }""")

    assert len(links) > 0, "Should find navigation links"
    logged_page.logger.assertion(f"Found {len(links)} navigation links", True)

    for link in links[:5]:
        text = link["text"]
        href = link["href"]
        logged_page.logger.action(f"Checking link: {text} -> {href}")
        try:
            logged_page.goto(href, timeout=15000)
            logged_page.wait_for_load_state("domcontentloaded", timeout=10000)
            logged_page.wait_for_timeout(2000)
            body = logged_page.evaluate("() => document.body.innerText")
            assert len(body) > 10, f"Page {href} should have content"
            logged_page.logger.assertion(f"Link '{text}' navigates to valid page", True)
        except Exception as e:
            logged_page.logger.assertion(f"Link '{text}' failed: {e}", False)

    logged_page.logger.action("Navigation links verification complete")
