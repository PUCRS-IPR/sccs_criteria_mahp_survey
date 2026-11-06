# SCCS criteria survey

Expert pairwise judgment questionnaire for site selection for SCCS in ultra-deepwater salt domes, using Fuzzy-AHP.

## Local development

```sh
npm ci
npm start
```

Run the automated checks with `npm test`.

After changing JavaScript, CSS, confidence levels or topic definitions, run
`npm run generate:confidence` to update the initial options and local asset versions.
The automated checks verify that the HTML stays in sync with the source files.

## GitHub Pages

The website lives in `src/`. The deployment workflow publishes the contents of that folder at:

https://pucrs-ipr.github.io/sccs_criteria_mahp_survey/

1. In the repository's **Settings > Pages > Build and deployment**, set **Source** to **GitHub Actions**.
2. Commit and push `.github/workflows/deploy-pages.yml` to `master`.
3. Wait for **Deploy survey to GitHub Pages** to complete in the **Actions** tab. After the workflow is on `master`, it can also be run manually there.

Future pushes to `master` automatically deploy the survey. No build step is needed; HTML, CSS, JavaScript, images, and `robots.txt` are served directly from `src/`.

Publishing the repository root from a branch causes a 404 at the site URL because there is no root `index.html`. Publishing `src/` puts `index.html` and its assets at the expected URLs, including the images referenced by the sharing metadata.
