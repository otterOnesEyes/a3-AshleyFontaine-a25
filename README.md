## Presistent WACCA Leaderboard Tracker Web Application

https://a3-ashleyfontaine-a25-production.up.railway.app/

The goal of this application is to provide a secure way for players of a specific arcade game, in this case the rhythm game "WACCA" to upload their scores, stats, and compete on a leaderboard. Users can log in using their unique username and password and input, edit, and delete their scores from the database stored in MongoDB.

My biggest challenges in this project mostly were faced in presistently connecting the MongoClient to the database while it was being passes through several middleware functions. I wasn't sure how it was supposed to work from the tutorials provided, and ultimately had to rework my entire server side Express.js. This did result in my final product have somewhat cleaner code, but still took a lot of additional work. Converting my serverside code to Express in the first place took some work, I have had little experience with javascript in the past. I also had never used a CSS template before, so that took some difficulty to learn and understand, but it mostly built upon my pre-existing knowledge.

My authentication strategy I ended up with was a simple check on the server-side if an input username and password match what is present in the database, and simply allowing the creation of a new profile if no log in existed. I choose this because it was relatively simple to implement and had already sort of existed in my previous version of this project.

I used Bootstrap as a CSS framework. As I don't have too many elements on my page, it was very simple to add basic colors and formatting tags to organize my page well. It also easily replaced the flex boxes I was using to grid my page, which was useful.

I did not use any Express middleware packages that were not of my own creation. I used them to make the flow of the server side more clear.
  start_connection -- Sets up the MongoDB connection. Additionally gets the leaderboard collection to be operated on later down the line and stores it in the req. Also writes the head of the response so more info can be freely added to the response.
  getDataString -- Parses the text sent in a post request to be used later in req. Calls upon gradeScore to derive a field
  updateLeaderboard -- Updates, adds, or removes data from the database based on the input information. Additionally makes the same updates to the leaderboard already pulled from the database so that the clientside leaderboard may be properly displayed later.
  constructLeaderboard -- Takes the leaderboard gotten from the database earlier and builds it into an HTML string to be insert into the webpage on the client-side.
  loginUser -- Determines if a user is able to log into the leaderboard. If they already exist, their password must be the same, and the data of the user is added to the returned string so the input boxes will display their stored information. If they don't already exist, empty (or 0) boxes are returned to the user so they may input their information.

## Technical Achievements
- **Alternative Hosting Service**: For this project, I elected to use Railway instead of Render. It was relatively simple to set up, and connected to Github easily to use my repo. While getting my service running was simple, I had to look up how to generate a domain for my service, which is already done in Render. As a positive, it seems to deploy much faster after changes and new commits. On the flipside, it appears Railway only authorizes a free trial, and would take additional payment if I wanted to run my service beyond 30 days.
- **100% on All Lighthouse Tests**: I had first examined this statistic while working on my page, noting a few issues with accessiblity, SEO, and best practices, losing most points for lacking some meta information and small button sizes. After applying Bootstrap, many of those problems went away, leaving me to handle some problems in SEO. I developed a meta description for my page for search engines to find easily, and set up a "robots.txt" file so that search crawlers knew where to look through on my site. Results after these changes are available in the "Lighthouse Result.png" file included.

### Design/Evaluation Achievements
- **Accessibility using W3C Hints**: I followed the following tips from the W3C Web Accessibility Initiative and made my application more accessible by:
1. Using descriptive headings
  While I already had simple headings for the UI on the site, I made them more descriptive. "Log In" became "Log In or Create Account", and I added a new header for the actual leaderboard.
2. Providing clear instructions
  Adjusted some of the text associated with the UI to better explain in less technical terms how to access and use the service, as well as being more explanitory on how to log in.
3. Keeping content clear and concise
  Cut down on a lot of additional dialect in the header of the page. Made a tooltip for one piece term "Missless" since it's an inherently confusing part to the game's statistics.
4. Provided sufficient contrast between background and foreground
  Most of my application already uses black text on white or light gray background, but the "Log In" UI had a dark red background with black text laid over it, so I instead elected to fill that dark red with a light gray as well, giving more contrast to the text.
5. Interactive Elements are easy to identify
  The buttons and input boxes in my application are fairly standalone, and the buttons change in tone upon hovering over them. I put a little extra space between the username and password boxes, to make sure they didn't blend together.
6. Clearly associated labels on form elements
  All input boxes and buttons have a clear label placed directly next to them, with enough space as not to confuse them.
7. Heading and spacing to group related content
  While there is not much content on the page, the 3 main sections-- the header, the input interface, and the leaderboard, all have well defined regions by background color and space. Each area has its own heading. When the input form is visible, the radio buttons are group together with some space between the other input fields.
8. Associated labels with every form control.
  Also a requirement for Google Lighthouse, each form element on my application has a label associated with it, placed to the side to describe what the form element represents.
9. Identify page language
  I thought this would have been covered already, but I did have to add a "html lang=en" element to my application
10. All interactive elements are keyboard accessible
  Tested myself, I was able to use the Tab key to access all elements on the page, change, and use each element.
11. Included alternative text for images
  For the logo present in the page header, I added alt-text to replace what the image represents, simply the name of the game in question.
12. Wrote meaningful text alternatives for images
  Since the image is meant to be part of the page title, a screen reader reading it simply as "WACCA" makes more sense than saying "WACCA logo" or nothing at all.
