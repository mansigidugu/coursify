def check_format(text: str) -> dict:
    # Perform basic heading checks
    has_h1 = text.strip().startswith("# ")
    has_h2 = "## " in text

    if has_h1 and has_h2:
        return {
            "success": True,
            "message": "Formatting is valid: found both an H1 title and at least one H2 section heading.",
        }

    missing = []
    if not has_h1:
        missing.append("an H1 title ('# ') at the start of the document")
    if not has_h2:
        missing.append("at least one H2 section heading ('## ')")

    return {
        "success": False,
        "message": "Formatting is invalid: missing " + " and ".join(missing) + ".",
    }
