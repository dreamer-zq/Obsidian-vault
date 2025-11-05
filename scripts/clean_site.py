"""
clean_site
Remove the local MkDocs output directory safely before deployment.

Functionality:
- Deletes the "site" directory at repository root if it exists.
- Prevents build conflicts when output overlaps with source.
- Prints actions for CI logs.
"""
import os
import shutil


def clean_site(path: str = "site") -> None:
    """
    Remove the MkDocs output directory to ensure a clean build.

    Args:
        path: target directory to remove (default: "site").
    """
    if os.path.isdir(path):
        shutil.rmtree(path)
        print(f"Removed '{path}' directory.")
    else:
        print(f"Directory '{path}' does not exist; nothing to clean.")


if __name__ == "__main__":
    clean_site("site")