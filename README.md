# First Baptist Church of Rockledge

Jekyll source for the First Baptist Church of Rockledge website.

## Local preview

This project uses the GitHub Pages Jekyll dependency set. Install dependencies, then start the local server:

```bash
bundle install
bundle exec jekyll serve --livereload
```

Open `http://localhost:4000` in a browser. If your shell resolves to an older system Ruby, use a Homebrew Ruby 3.1 installation:

```bash
PATH="$(brew --prefix ruby@3.1)/bin:$PATH" bundle exec jekyll serve --livereload
```

## Structure

- `_layouts/default.html` contains the shared page shell.
- `_includes/` contains the reusable header and footer.
- `assets/` contains styles and images.
- Top-level page folders provide the public routes: `/about`, `/events`, `/services`, `/blog`, and `/contact`.

## Deployment

GitHub Pages can publish this repository from the `main` branch and repository root. Configure the custom domain `fbcrockledge.org` in the repository's Pages settings when the DNS cutover is ready.
