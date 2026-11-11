# Potty website

A presentation website for **Potty**, the humanised toilet concept from our Human-Centered Design course. It has six pages: Home, Features, How it works, Our design story, Sign in and a private dashboard.

## Opening it

1. Unzip the folder.
2. Double-click `index.html`. It opens in your browser, with no installation needed.

If the sign-in page says your browser can't encrypt data (some browsers restrict this for files opened straight from disk), start a small local server from inside the folder instead:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Demo login

- Username: `margaret`
- Password: `potty123`

You can also click **Create account** to make your own. Every account gets its own made-up health history.

## How the privacy demo works

There is no server or database. Accounts are saved only in the visitor's own browser, and each person's health data is **really encrypted** (AES-GCM, with a key made from their password using PBKDF2). The dashboard's "Who can see your data?" panel shows what's actually stored: scrambled text for a stranger, readable data for you. Closing the tab locks it again.

It is a convincing demo, not production security. Passwords can't be recovered, and clearing the browser's site data removes the accounts.

## Changing the content

Nearly all the text lives in **`assets/js/content.js`**: the product name, features, steps, personas, design principles, version history (`releases`), the Tech story sensors (`technology`), Potty's chat lines and the demo login. Edit the words between the quotes and refresh the page.

- **Add or remove a feature:** copy or delete a `{ ... }` block inside `features`. It appears on the home page and the features page automatically.
- **Record a new version:** add an entry to `releases` (set `major: true` for a big change, which jumps to the next whole number) and update `product.version`.
- **Use your own images:** put them in `assets/img/` and change the `image` / `heroImage` paths in `content.js`.
- **Colours and text size:** these are set at the top of `assets/css/styles.css`.

## Built for 40 to 70 year olds

See [CHANGELOG.md](CHANGELOG.md) for the full list. In short:

- **Visual:** a **Display** button in the menu changes the text size (up to extra large), switches between light and dark colours, and turns on high contrast or turns off animations. Nothing relies on colour alone.
- **Motor:** large buttons (at least 48px), generous spacing, full keyboard use, and no precise mouse movements needed.
- **Hearing:** Potty's speech is always captioned, reading aloud is optional, and every action shows an on-screen message.
- **Cognitive:** plain language, sign-up in two short steps, instructions under each field, and no time limits.
- **Confidence:** unfamiliar steps are explained, success and errors are always confirmed, and deleting asks first in plain words.

## The interactive model on the home page

Press the toilet picture, or **Look inside Potty**, to take Potty apart into layers. Each layer is linked to a feature by its `id`. The order is set in `content.js` → `home.explode.layers`, and the short layer names come from each feature's `layerLabel`.

How it's built:
- `assets/img/potty-front.png` is the whole-Potty front photo, cut out on a transparent background (`home.heroImage`).
- `assets/img/pieces/` holds both front photos cut into matching parts: `<part>-together.png` (from the whole photo) and `<part>-apart.png` (from the taken-apart photo).
- In `assets/js/pages.js`, `TOGETHER` and `APART` give each part's box in the two photos. When Potty comes apart, each part glides and stretches from its together box to its apart box while the two pictures blend. `GEO` groups the parts into the four layers (`face`, `personality`, `skin`, `scanner`) and sets where each number badge sits. The personality chip and the sensor ring are drawn there, because they can't be seen in the photos.
- The original photo sheets are in `assets/img/source/` (the `-nobg` ones are used).
- Inside the focus view, the main button takes Potty apart and puts it back together; only ✕ Close (or Escape) leaves the view.

## Potty from every side

A home-page section that shows the other photos. Choose a side, then **Put together** or **Taken apart**. The photos are `assets/img/views/together-<side>.png` and `apart-<side>.png`; the list of sides and the labels are in `content.js` → `home.angles`.

## Meet Potty page

`character.html` presents Potty's character: profile, a day with Potty, a scripted chat, comfort, how the connection grows, Potty's own health, boundaries and the design reasoning. All text, including the chat script (`character.chat`: each topic has Potty's opening line and three replies), is in `content.js` → `character`.

## Developer area (for assessors)

`developer.html` is locked with a demo sign-in: username **admin**, password **admin** (set in `content.js` → `developer.demoUser`). It is not real security; it only keeps the area out of the way. It is linked from the footer of every page and from the Design story page, but not from the main menu.

Inside is the animated version history. Each version comes from `content.js` → `releases`. Its `visual` names one of the pictures drawn in `assets/js/pages.js` (`developerPage`), and "Read more" shows its `notes` and `changes`. Two more pages sit behind the same sign-in, reached by the tabs at the top: **Architecture** (`developer-architecture.html`, content in `developer.architecture`) draws its diagrams from the lists there, and **Technologies** (`developer-technology.html`, content in `developer.technologies`) lists each technology with why and how it was used. The lines-of-code numbers in `developer.technologies.code` are typed in, so update them when the code grows. **How we worked with Claude** (`developer-prompts.html`) shows our prompting framework (`developer.prompts`).

## Validation (checking the rules)

The rules the website must follow are in `content.js` → `developer.validation.rules`. Each rule has an `id`. `tests/validate.js` has a check with the same id, opens every page in a real browser and writes the results to `assets/js/validation-results.js`, which the Validation page (`developer-validation.html`) shows. Rules marked `eye: true` are checked by a person.

To run the checks (needs Node.js), from the potty-website folder:

```
npm install --prefix tests
npx --prefix tests playwright install chromium   (first time only)
node tests/validate.js
```

Adding a rule: add it to `developer.validation.rules`, then add a matching `rule("your-id", ...)` check in `tests/validate.js`.

## Tech story page

`technology.html` explains the health sensors Potty would use if money were no object. Edit `content.js` → `technology`. `zones` places the numbered spots on the picture (x and y are percentages), and each entry in `sensors` belongs to a zone.

## Contact page

`contact.html` has one demo form: first choose **Send a message** or **Book a demo**, and only the matching questions are shown. Nothing is sent. Company details, offices, topics, demo places and questions and answers are in `content.js` → `contact`.

## Iteration notes

Each design iteration is recorded in two places:
- on the website, in the **Developer area** (`content.js` → `releases`, with a `changes` list)
- in [CHANGELOG.md](CHANGELOG.md) for documentation

## Folder structure

```
index.html, features.html, character.html, how-it-works.html, technology.html, design.html,
contact.html, login.html, dashboard.html, developer.html, developer-architecture.html,
developer-technology.html, developer-prompts.html, developer-validation.html (the developer pages are locked, admin / admin)
assets/css/styles.css     look and feel
assets/js/content.js      all editable text
assets/js/validation-results.js  latest results of the automatic checks (written by tests/validate.js)
tests/validate.js         the automatic checks for the validation rules
assets/js/site.js         shared header, footer, Potty drawing, reading options
assets/js/pages.js        builds the information pages, Contact, Meet Potty, Tech story and the developer area
assets/js/auth.js         demo login and encryption
assets/js/login.js        sign-in / create-account page
assets/js/dashboard.js    private dashboard
assets/img/               illustrations (replace freely)
```

## Hosting later

It is a plain static site, so it can be hosted anywhere for free. For example, drag the folder onto Netlify Drop (app.netlify.com/drop) or push it to GitHub Pages.
