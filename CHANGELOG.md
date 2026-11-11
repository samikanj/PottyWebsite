# Potty website: iteration log

Design documentation for the Human-Centered Design course. Each iteration records what changed and why. The same notes appear on the website in the **Developer area** (`developer.html`, sign in with admin / admin). Edit them in `assets/js/content.js` → `releases`.

**Version numbers (from v4.0):** a minor update goes up by 0.1 (v2.1 → v2.2). A major update jumps to the next whole number (v3.1 → v4.0). Older versions were renumbered to match: old v0.4 → v1.0, v0.5 → v1.1, v0.6 → v2.0, v0.7 → v2.1, v0.8 → v2.2, v0.9 → v3.0, v1.0 → v3.1.

---

## v4.3 (4 November 2026, minor)

**Goal:** show technical validation. Our teacher's workshop *From behaviour to code* explains that when AI builds the software, validation means setting the rules it must follow and checking them, with us as the driving force.

### New: Validation page (`developer-validation.html`)
- The workshop's seven steps (look, name the rules, split it up, model, build, test, change), each with an example from Potty, and its closing quote translated from Dutch.
- "From what we said to a rule we can test": three of our own messages, each turned into a rule and a check.
- **19 rules** in four groups: accessible for 40 to 70 year olds, our feedback turned into rules, privacy and security, works everywhere. Each rule names its source (a guideline or our feedback for a version).
- Each rule shows its latest result: Passed, Failed, or Checked by eye for the three rules a person must judge (smooth edges, warm plain language, Potty as a companion called "it").

### New: automatic checks (`tests/validate.js`)
- Opens every page in a real browser (Chromium, using Playwright) on phone and computer sizes, and checks the 16 automatic rules: button sizes, extra large text, picture descriptions, one main heading, dark theme, animations off, keyboard use, no pop-ups, Look inside staying open, the menu on one line, the single contact form, scrambled health data, the developer lock, no outside requests, no errors and no sideways scrolling.
- Writes the results to `assets/js/validation-results.js`, which the Validation page reads. Latest run: 16 of 16 passed.
- Run it with `npm install --prefix tests`, then `node tests/validate.js`.

### Changed
- **How we worked with Claude:** the full conversation transcript was removed. The prompting framework, working loop and lessons stay, with a new lesson: set rules, then check them.

## v4.2 (4 November 2026, minor)

**Goal:** assessors asked to see how we prompted Claude, so they can see what we did ourselves.

### New: How we worked with Claude (`developer-prompts.html`)
- A fourth tab in the developer area, behind the same admin / admin sign-in.
- **Prompting framework:** the seven ingredients of our prompts (context, goal, design direction, audience and rules, scope, feedback, talking first), each with a real quote from our messages.
- **Working loop:** a diagram of the six steps every version went through, and six lessons about prompting.
- **Full conversation:** every message from the project chat that built the site, grouped by version. Our messages are unedited, typos included. Claude's short "on it" notes and progress checklists are left out, and its longer replies fold away behind "Show the full reply". The conversation lives in `assets/js/transcript.js`.

### Changed
- **Technologies:** Claude added under "Tools behind the scenes".
- **Developer tabs:** on phones they scroll sideways instead of stacking.
- **Read more:** the sliding animation is now shared with the transcript.

## v4.1 (22 October 2026, minor)

**Goal:** fill in the developer area's architecture and technology sections, and make Read more feel smoother.

### New: Architecture page (`developer-architecture.html`)
- Five animated diagrams: what happens when a page opens (six steps), how the files fit together (five layers), the site map with its two locked areas, how health data stays private (PBKDF2 and AES-GCM), and how the Look inside model was made from the AI pictures.
- A short list of design decisions: no build step, opens from a folder, one file for the words, accessible by default, private by design.

### New: Technologies page (`developer-technology.html`)
- A bar showing what the code is made of (JavaScript, CSS, HTML, by lines of code).
- A card for every technology with what it is, why we chose it, how we used it and where it is in the code: HTML5, CSS3, JavaScript, Web Crypto, Web Storage, Intersection Observer, SVG, media queries, Google Fonts, line icons, the AI image generator, Python (Pillow, NumPy, OpenCV) and Playwright.
- What we chose not to use, and why.

### Changed
- **Developer area tabs:** every developer page has tabs for Version history, Architecture and Technologies, and a Leave button. All three pages share the admin / admin sign-in.
- **Read more:** the notes slide open and closed instead of jumping, and the + turns into a ×. With animations turned off it opens instantly.
- The "Coming next" cards now link to the new pages. Accessibility checks is still to come.

## v4.0 (22 October 2026, major)

**Goal:** give assessors one place for the project's history, explain the health technology in depth, and tidy the menu.

### New: Developer area (`developer.html`)
- Locked with a demo sign-in: username **admin**, password **admin**. A "Fill it in for me" button helps assessors. It stays open until the browser tab is closed, or "Leave the developer area" is pressed.
- Holds the animated version history that used to be the Iterations page. Each version has a **Major update** or **Minor update** badge (major versions get a bigger dot on the line) and a **Read more** button with the full notes and change list.
- Two new pictures: a timeline filling in (v3.1) and Potty being scanned (v4.0).
- A "Coming next" section reserves space for the website's architecture, technology and accessibility checks.
- **Where it lives:** kept out of the main menu so the site still feels like a real product. Assessors find it through a small "Developer area" link in every page's footer, and a short "Assessing this project?" note on the Design story page where the iterations used to be.

### New: Tech story page (`technology.html`)
- Imagines Potty with no budget limit: twelve sensors across the bowl, seat, armrests and backrest.
- A picture of Potty with numbered spots. Tapping a spot (or a tab) shows the sensors there, each with where it sits, how it works, what it looks for and what happens next.
- "The journey of a sample" in six steps, a privacy section and a note that this is a concept, not medical advice.

### Changed
- **Version numbers:** major and minor updates, and the dates spread from 14 October to today (see the note at the top).
- **Design story:** the iterations list was removed and replaced with a pointer to the developer area.
- **Iterations page:** removed (`iterations.html`); it now lives in the developer area.
- **Menu:** labels never wrap onto two lines. The header can be wider than the page content, and when the links still don't fit (smaller windows or bigger text) the menu folds into the Menu button.
- **Menu items:** added "Tech story".

## v3.1 (21 October 2026, minor; was v1.0)

**Goal:** give the iterations a page of their own, told with pictures and animation instead of text.

As agreed, this version only adds the new page. The iteration notes on the design page and the version shown on the site were left untouched.

### New: Iterations page (`iterations.html`)
- In the main menu as **Iterations**. The text is in `content.js` → `journey`, with one entry per version: number, date, a short title, two to four short labels, and which picture to show.
- A row of version buttons at the top jumps straight to any version. A line on the left fills up as you scroll, and each version's dot lights up when you reach it.
- Each version slides in as you scroll to it, with its own animated picture:
  - **v0.1:** six mini pages drop in, then the four feature icons pop up.
  - **v0.2:** text grows, a light/dark switch flips, a big button pulses and a caption types itself.
  - **v0.3:** Potty glides to the centre as the page behind it blurs, a pop-up is crossed out, and pins drop on Stara Zagora and Beirut.
  - **v0.4:** the old drawing fades back and the new render slides in.
  - **v0.5:** the message form and the demo form slide together into one form.
  - **v0.6:** the five angle photos fan out.
  - **v0.7:** two magnifiers compare a jagged edge with a smooth one.
  - **v0.8:** a small copy of Look inside Potty keeps coming apart and going back together.
  - **v0.9:** a short chat with Potty appears bubble by bubble.
- Ends with "What's next?", with links to the Contact page and to the full notes.
- With animations turned off in Display (or on the device), everything is shown in its finished state straight away.

---

## v3.0 (21 October 2026, major; was v0.9)

**Goal:** give Potty's character, one of the main humanising features, its own page.

Decisions made with the team: Potty is described as a **companion** (not "partner", which visitors could misread), the page has a **scripted chat** demo, and Potty is always called **"it"**.

### New: Meet Potty page (`character.html`)
- In the main menu as **Meet Potty**. The text is in `content.js` → `character`.
- **Intro:** Potty's photo with its hello.
- **Who Potty is:** six traits (warm, patient, curious, discreet, honest, never judging), what it cares about, and what it never does: flirt or act romantic, lecture, share what you say, or pretend to be a doctor. A note explains why Potty is "it".
- **A day with Potty:** morning, late morning, afternoon and evening examples. These cover a gentle hello, a short news briefing in place of the phone or newspaper, talking about your day, and winding down.
- **Try talking to Potty:** a scripted chat. Choose a topic (Talk about my day, Tell me the news, How is my health?, How are you, Potty?, I'm feeling low), then one of three replies, and Potty answers. Captions are always on, there's an optional Read aloud button and a Start again button, and everything works with a keyboard. The news headlines are labelled as made up.
- **Comfort you can feel:** how the warm skin-like cushions, calm voice, soft light and no rushing combine into a safe space.
- **A connection that grows:** the first week, the first month and after a few months.
- **Potty's own health:** Potty reports on its cushions, sensors, water filter and software in plain words, each with a ✓ or ! label.
- **Boundaries you control:** platonic by design, choose how chatty it is, quiet mode, "forget this", private conversations, and not a doctor.
- **Why we gave Potty a character**, linked to the personas, and a link to the demo.

### Linked from
- The personality card on the home page, its section on the Features page (a **Meet Potty's character** button) and layer 2 in Look inside Potty.
- The personality feature gained a point: "Chats about your day and reads you the news, instead of scrolling on your phone".

---

## v2.2 (20 October 2026, minor; was v0.8)

**Goal:** use the background-free photos, and let people stay in the Inside Potty view.

### Background-free photos
- New photo sheets without a background (`assets/img/source/*-nobg.png`) replace the ones cut out by us, so the outlines are clean, not jagged.
- Rebuilt from them: the home page photo, every Look inside part (whole and taken apart) and all ten Potty from every side photos. Each is enlarged with its own soft edge, so it stays smooth on large screens.
- Stray specks left around the photos and the view labels ("FRONT VIEW" and so on) are removed.

### Inside Potty view stays open
- **Put Potty back together** now reassembles Potty inside the view instead of going back to the page.
- The button then reads **Take Potty apart**, so visitors can take it apart and put it back as often as they like.
- Only **✕ Close** goes back to the page (the Escape key still works too, for keyboard users). Pressing the blurred background no longer closes the view.
- Choosing a numbered layer while Potty is together takes it apart again.

---

## v2.1 (19 October 2026, minor; was v0.7)

**Goal:** smooth the edges of Potty, and make the whole photo and the taken-apart photo blend into each other.

### Smooth edges
- Every cut-out of Potty (the home page photo, the Look inside parts and the every-side photos) was rebuilt at higher detail (three times for the home photo and Look inside parts, twice for the every-side photos). The outlines are now smoothed and softly blended into the background, instead of jagged pixel steps.
- In the every-side photos, the inside of the bowl is no longer see-through.

### Parts that reshape
- In v0.6, the pieces came from the taken-apart photo only, and the whole photo faded out on top. Because the two photos don't match exactly (for example, the backrest is a slightly different shape), you could see the switch.
- Now the whole photo is cut into the same parts too: backrest, display panel, both armrests, seat cushion and shell.
- When Potty comes apart, each part glides from its place in the whole photo to its place in the taken-apart photo. It stretches into the new shape on the way, while its whole-photo look fades into its taken-apart look. Closing does the same in reverse.
- The bowl, the personality chip and the sensor ring only exist in the taken-apart view, so they fade in.

---

## v2.0 (18 October 2026, major; was v0.6)

**Goal:** use the new product photos, and make Look inside Potty move smoothly.

### New product photos
- Potty is now shown from the front, both sides, the back and above, each both put together and taken apart. The original photo sheets are kept in `assets/img/source/`.
- The home page picture is the new front photo, cut out so it sits on the page's warm background.

### Smoother Look inside Potty
- The model is built from the new taken-apart front photo, cut into pieces: shell, bowl, display panel, seat cushion, both armrests and the backrest.
- Potty starts as the whole photo. The pieces then glide apart from the shell while the whole photo fades away, so there is no jump between pictures.
- Closing reverses this: the pieces glide back together first, then Potty glides back to its place on the page.
- The face display and the bowl are now real parts of the photo. Only the personality chip and the sensor ring around the bowl are drawn in.
- With animations turned off in Display, Potty changes straight away.

### New: Potty from every side
- A new section on the home page. Choose a side (Front, Left side, Right side, Back or From above), then **Put together** or **Taken apart**.
- The choices are large buttons, and each photo has a text description.

---

## v1.1 (17 October 2026, minor; was v0.5)

**Goal:** make Look inside Potty use the real product image, and simplify contacting us.

### Look inside Potty uses the real image
- The product render was cut into transparent pieces (`assets/img/pieces/`): the shell, the backrest cushion, the left and right armrest cushions, and the seat cushion.
- Put together, the pieces line up exactly with the photo, without the bathroom background.
- When Potty is taken apart:
  - the backrest lifts up, the armrests move out, and the seat cushion lifts off the shell
  - where the cushions sat, the shell shows a soft recessed surface
  - the parts the photo can't show fade in: the face display, the personality chip and the sensor ring around the bowl
- The numbered layers, highlighting, list and explanation work as before.

### One contact form
- The separate "Send us a message" and "Book a demo" forms are now one **Get in touch** form.
- Its first question is "What would you like to do?", answered with **Send a message** or **Book a demo**.
- Name, email, phone, how we should reply and consent are shared. The form then shows only the questions for the chosen option:
  - **Send a message:** topic and message.
  - **Book a demo:** place, date, time of day and an optional note.
- The submit button and the confirmation change to match the choice. It's still a demo, so nothing is sent.

---

## v1.0 (17 October 2026, major; was v0.4)

**Goal:** adopt the new product design and give contact details their own page.

### New product design
- Potty is now the design from our render (`assets/img/potty-product.jpg`): a rounded cream shell with soft pink, skin-like cushions on the seat, the two armrests and the curved backrest.
- The home page shows the render. Pressing it, or **Look inside Potty**, swaps to a drawing of the same design that comes apart in the centred focus view.
- The layers are:
  1. the face display and speaker in the backrest
  2. the personality chip behind the display
  3. the seat, armrest and backrest cushions
  4. the sensor ring inside the bowl
- The selected layer glows, and the rest of the shell fades back.
- The "Skin-like seat" feature became **Skin-like cushions**. It covers the seat, armrests and backrest, and adds the support the armrests give when sitting down and standing up.
- The small Potty drawings on the sign-in page, the dashboard and How it works were redrawn in the new shape, so the brand is consistent.

### Contact
- The contact section was removed from the bottom of every page. Contact details now live in the **footer**:
  - company email, phone and opening hours
  - both offices (Stara Zagora and Beirut)
  - a link to the Contact page
- New **Contact page** (`contact.html`, also in the main menu), a demo only, with nothing sent:
  - **Send us a message:** name, email, optional phone, a topic chosen from large buttons, the message, how we should reply, and a consent tick box.
  - **Book a demo:** name, email or phone, where (Stara Zagora studio, Beirut office or video call), an optional date, and the best time of day.
  - Friendly error messages appear next to the field that needs fixing. Success is confirmed in the page with a reference number and what happens next, plus a button to start again.
  - Office details and "Before you write" questions and answers.
- All company details remain fictional and are labelled as such.

---

## v0.3 (16 October 2026)

**Goal:** calmer feedback, a focused "look inside" experience, and company contact details.

### Removed
- **Pop-ups after small changes.** Changing a display setting (such as light or dark mode) or switching a dashboard setting on or off no longer shows a pop-up message. The highlighted choice (✓) and the On or Off label already show that the change worked, so the pop-ups felt like interruptions.
- Pop-ups remain only for bigger moments where confirmation matters: signing in or out, downloading data, deleting the account or cancelling the deletion, and errors.

### Changed: "Look inside Potty" focus view
- Pressing **Look inside Potty**, or the picture itself, now glides the toilet to the centre of the screen and blurs the page behind it, so attention stays on Potty's layers.
- On wide screens the numbered layer list sits on the left, Potty in the middle and the explanation on the right. On smaller screens they stack.
- Ways to leave: **✕ Close**, **Put Potty back together**, the Escape key, or pressing the blurred background. Potty glides back to its place on the page.
- While the view is open, the page behind can't be scrolled or tabbed into, and keyboard focus starts on the first layer.

### New: Contact us
- A contact section above the footer on every page, also linked from the footer.
- Details for **Potty Care Ltd.**: an email, a phone number and opening hours.
- Offices:
  - **Stara Zagora, Bulgaria:** head office, design studio and workshop.
  - **Beirut, Lebanon:** health research lab and customer care.
- All details are fictional and labelled as such. Edit them in `content.js` → `contact`.

---

## v0.2 (15 October 2026)

**Goal:** an accessibility pass for our 40 to 70 audience, plus an interactive model of Potty.

### Fixes
- **Dark theme button.** In v0.1 the round "◐" button only darkened the text slightly, so it looked broken. It's now part of a new **Display** panel that switches the whole site to a proper warm dark theme. The theme follows the device's own setting until the visitor chooses one, and the chart colours were re-checked for colour-blind safety on the dark background.

### New: interactive "Look inside Potty" model (home page)
- Pressing the toilet picture, or the **Look inside Potty** button, takes Potty apart into its layers: display and speaker, personality chip, soft seat layer and sensor ring.
- Each layer gets a number. Choosing a layer, from the numbered list or by pressing it in the picture, highlights it, dims the rest and shows what that feature does, with a link to the full feature.
- **Put Potty back together** reassembles it. The layers to show are listed in `content.js` → `home.explode.layers`.

### Visual accessibility
- New **Display** settings with clear text labels: text size (Standard, Large, Extra large), colours (Light, Dark), contrast (Standard, High) and animations (On, Off). Choices are remembered on the device.
- Larger base text (19px), and the layout works when the browser is zoomed in.
- No information is shown by colour alone:
  - Status pills carry ✓ or ! plus words.
  - Alerts have a symbol and a label ("Good news", "Worth a look", "All normal").
  - Switches show "On" or "Off".
  - The chart's gut line is dashed as well as a different colour, and both lines are labelled directly.
  - The current page in the menu is underlined, and selected tabs are underlined.
- Icon-only buttons were replaced with icon-plus-text buttons ("Display", "Menu", "Read it aloud").

### Motor accessibility
- Everything you can press is at least 48 pixels tall, with more space between buttons, chips and links.
- The whole site works with a keyboard: skip link, visible focus outlines, Escape closes the Display panel, and the chart can be read with the arrow keys.
- The chart no longer needs precise mouse movement. You can tap it, use the keyboard, or open the table view.

### Hearing accessibility
- Everything Potty says is shown as a written caption, with a note that captions are always on.
- An optional **Read it aloud** button lets the browser speak the message; turning Potty's voice off is respected.
- Every action shows a visual on-screen notification, and no instruction relies on sound.
- The feature copy now lists "Captions on the display for everything Potty says" and "Lights and on-screen messages as well as sounds".

### Cognitive accessibility
- Creating an account is now two short steps ("About you", then "Your sign-in details") with a progress bar.
- Each field has plain-language instructions underneath it, and live checklists show the password rules being met.
- Each health number has a one-line explanation of what it means and what's good.
- The dashboard has a "Jump to" row (Talk to Potty, My health, My settings, My privacy) and keeps the same layout every time.
- There are no time limits. Notifications stay for about 9 seconds and have a Close button.

### Digital confidence and security
- A "Why do I need a password?" explanation sits on the sign-in page.
- Security messages were rewritten in plain words, with no technical warnings (for example, "This browser can't open a private space from here. Please try Chrome, Edge, Firefox or Safari.").
- Success is always confirmed on screen:
  - signed in, signed out, settings saved, demo details filled in, data downloaded (with where to find the file)
  - account deleted, or "Nothing was deleted" when cancelled
- Deleting an account now uses a clear dialog with named choices ("Yes, delete everything" or "No, keep my account") instead of a generic browser pop-up.
- The main next action is always a single clearly labelled button, such as "Next: choose a password →", "Sign in" or "Create my private space".

---

## v0.1 (14 October 2026)

**Goal:** the first presentable concept website.

- Pages: Home, Features, How it works, Our design story, Sign in, and a private dashboard.
- Features presented: skin-like seat, health scanner, a learning platonic companion personality, and a digital face and voice.
- Demo login with no server. Health data is encrypted in the browser with a key made from the user's password, and a "Who can see your data?" panel shows the scrambled stored data next to the readable version.
- Made-up health data: 30 days of hydration, gut health and fibre, plus kidney, sugar and blood markers.
- Warm and friendly visual style aimed at 40 to 70 year olds. All text is editable in `assets/js/content.js`.
