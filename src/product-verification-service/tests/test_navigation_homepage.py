def test_navigation_homepage(logged_page):
    logged_page.logger.action("=== HOMEPAGE LOAD VERIFICATION ===")

    logged_page.goto("http://localhost:3010", timeout=15000)
    logged_page.wait_for_load_state("networkidle", timeout=10000)
    logged_page.wait_for_timeout(3000)

    title = logged_page.title()
    assert len(title) > 0, "Page should have a title"
    logged_page.logger.assertion(f"Page title loaded: {title}", True)

    root = logged_page.query_selector("#root")
    assert root is not None, "#root should be present"
    logged_page.logger.assertion("React root element found", True)

    body = logged_page.evaluate("() => document.body.innerText")
    assert len(body) > 50, "Page should have rendered content"
    logged_page.logger.assertion(f"Body content length: {len(body)} chars", True)

    links = logged_page.evaluate("() => Array.from(document.querySelectorAll('a')).map(a => a.textContent.trim()).filter(Boolean)")
    assert len(links) > 0, "Page should have links"
    logged_page.logger.assertion(f"Found {len(links)} navigation links", True)

    logged_page.logger.action("Homepage verification complete")
