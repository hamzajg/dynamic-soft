def test_exploration_homepage(logged_page):
    logged_page.logger.action("=== HOMEPAGE EXPLORATION ===")

    logged_page.goto("http://localhost:3010", timeout=15000)
    logged_page.wait_for_load_state("networkidle", timeout=10000)
    logged_page.wait_for_timeout(3000)

    body = logged_page.evaluate("() => document.body.innerText")
    assert len(body) > 50, "Page should have content"

    headings = logged_page.evaluate("() => Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => h.textContent.trim())")
    assert len(headings) >= 1, "Page should have at least one heading"
    logged_page.logger.assertion(f"Found headings: {headings[:5]}", True)

    ctas = logged_page.evaluate("() => Array.from(document.querySelectorAll('a, button')).map(el => el.textContent.trim()).filter(Boolean)")
    logged_page.logger.assertion(f"Found {len(ctas)} clickable elements", True)

    images = logged_page.evaluate("() => Array.from(document.querySelectorAll('img')).map(img => img.src)")
    logged_page.logger.assertion(f"Found {len(images)} images", True)

    logged_page.logger.action("Homepage exploration complete")
