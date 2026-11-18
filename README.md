# Custom Home University

Minimal two-step application website for [customhomeuniversity.com](https://customhomeuniversity.com), hosted on GitHub Pages.

- index.html: landing page with a portrait video player, plus email and optional phone signup
- apply.html: seven-question plan review application, listed price $1,500
- thank-you.html: confirmation page shown ONLY after the backend verifies a successful application submission
- privacy.html: draft privacy page — review before publishing to real visitors
- assets/config.js: public settings for video URL and Google Apps Script submission endpoint
- assets/site.css and site.js: shared styles and form logic
- Homepage offer: $1,500 with a genuine annual capacity of no more than 50 new clients and a money-back satisfaction guarantee. This is not a live inventory count. The owner must update the separate private Google Apps Script notification email string from $1,495 to $1,500 and redeploy a new script version.

## Important: Forms are not connected yet

GitHub Pages cannot send email by itself. Until assets/config.js contains a Google Apps Script web-app URL, the homepage and application forms will **not** send submissions or redirect to the success page. A visitor sees a clear "not connected yet" message; no false success confirmation appears.

A separate *private* Google Apps Script backend file, Code.gs, with owner setup instructions was prepared for this project. Set OWNER_EMAIL as a Script Property in Google Apps Script, run setupStorage, deploy as a Web App executing as you and accessible to Anyone, then add its full HTTPS URL ending in /exec as backendUrl in assets/config.js. Test both lead and application submissions in a real browser, confirming Gmail and the private Google Sheet records.

Notifications are email-only; no SMS service is required.

The introductory video is configured as **intro-video.mp4** in the repository root. Download the optimized MP4 supplied with the website update and upload it using GitHub's **Add file → Upload files** on the repository main branch. The homepage checks whether the MP4 exists, and switches automatically from the video placeholder to an accessible portrait video player when it is present. The video itself is not stored in this commit because the GitHub connector cannot ingest local binary attachments. Another option is to upload the video as unlisted on YouTube and change videoUrl to the YouTube link.

Do not delete CNAME, which routes the custom domain to GitHub Pages.
