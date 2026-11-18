# Custom Home University

Minimal two-step application website for [customhomeuniversity.com](https://customhomeuniversity.com), hosted on GitHub Pages.

- index.html: landing page, 16:9 video placeholder, initial email field
- apply.html: seven-question plan review application, listed price $1,495
- thank-you.html: confirmation page shown ONLY after the backend verifies a successful application submission
- privacy.html: draft privacy page — review before publishing to real visitors
- assets/config.js: public settings for video URL and Google Apps Script submission endpoint
- assets/site.css and site.js: shared styles and form logic

## Important: Forms are not connected yet

GitHub Pages cannot send email by itself. Until assets/config.js contains a Google Apps Script web-app URL, the homepage and application forms will **not** send submissions or redirect to the success page. A visitor sees a clear "not connected yet" message; no false success confirmation appears.

A separate *private* Google Apps Script backend file, Code.gs, with owner setup instructions was prepared for this project. Set OWNER_EMAIL as a Script Property in Google Apps Script, run setupStorage, deploy as a Web App executing as you and accessible to Anyone, then add its full HTTPS URL ending in /exec as backendUrl in assets/config.js. Test both lead and application submissions in a real browser, confirming Gmail and the private Google Sheet records.

Notifications are email-only; no SMS service is required.

When ready to add an intro video, set videoUrl in assets/config.js to a supported YouTube/Vimeo/MP4 link.

Do not delete CNAME, which routes the custom domain to GitHub Pages.
