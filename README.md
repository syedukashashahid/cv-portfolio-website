# Syed Ukasha Shahid — Portfolio

A six-page portfolio site in plain HTML, CSS and JavaScript. No frameworks, no build step, no external libraries.

## Folder structure

```
portfolio/
├── index.html          Home
├── about.html          About Me
├── skills.html         Technical Skills
├── projects.html       Projects
├── education.html      Education
├── contact.html        Contact
├── style.css           Shared styles for every page
├── script.js           Shared behaviour for every page
└── assets/
    ├── profile.jpg                     Your photo (already included)
    ├── Syed_Ukasha_Shahid_CV.pdf       Your CV (already included)
    └── fonts/
        ├── archivo-variable.woff2      Archivo font, bundled so it works offline
        └── OFL-LICENSE.txt             Font licence
```

## Open it locally

1. Unzip the folder anywhere on your computer.
2. Double-click `index.html`. It opens in your browser and every page link works.

That's all you need. Optionally, to test it the way it will behave online, run a tiny local server from inside the folder:

```
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Replacing the photo or CV

- **Photo:** replace `assets/profile.jpg` with a new image using the exact same name. A portrait image (taller than wide) works best. If the file is missing, the site shows an orange "US" monogram placeholder instead of a broken image.
- **CV:** replace `assets/Syed_Ukasha_Shahid_CV.pdf` with the updated PDF, same name. When the site is hosted on a server and the file is missing, the CV buttons automatically switch to "CV not available yet" instead of leading to an error page. (Browsers don't allow this check when the page is opened straight from disk, so there the buttons always stay active.)

## The contact form

The site has no server, so the form cannot send messages by itself. After it validates the fields, it opens the visitor's email app with the message filled in and tells them nothing has been sent until they press Send. The email and phone links work everywhere. If you later want messages delivered directly, connect the form to a form service (for example Formspree or Netlify Forms) and update the `submit` handler in `script.js`.

## Publishing online (free)

- **GitHub Pages:** create a repository, upload the contents of this folder, then enable Pages in the repository settings.
- **Netlify:** drag the folder onto app.netlify.com/drop.

## Editing content

All text lives directly in the HTML files. The navigation and footer are repeated on each page, so if you add a page or change a link, update it in all six files.

## Accessibility and motion

- Works with keyboard only, including the mobile menu (Escape closes it).
- Visitors who turn on "reduce motion" in their system settings get a static version with no animations.
- All content stays visible if JavaScript is disabled.
