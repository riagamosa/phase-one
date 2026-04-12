# Set Up Instructions

## Create a root folder and install the required packages:
1. Create a new folder and name it
2. Open Visual Studio Code 
3. Open the newly created folder 
4. Open Terminal
5. Create a root project folder: mkdir foldername
6. Ensure you’re working in the root folder: cd foldername 
7. Initialize node project: npm init -y 
8. Install required packages: npm install express https fs helmet
9. Create new file: touch server.js
10. Place code into server.js file:
```
const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');

const app = express();

const PORT = 3000;

// helmet for security headers
app.use(helmet());

// homepage
app.get('/', (req, res) => {
    res.send('Secure Project App Running!');
});

// load ssl certificate
const options = {
    key: fs.readFileSync('path/to/private/key'),
    cert: fs.readFileSync('path/to/certificate'),
};

// create HTTPS server
https.createServer(options,app).listen(PORT, () => {
    console.log(`Secure Project App running at https://localhost:${PORT}`);
});
```

## Generate Self-Signed Certificate
1. Ensure OpenSSL is installed using a package manager like Homebrew: brew install openssl
2. Generate private key: openssl genrsa -out private-key.pem 2048
3. Generate self-signed certificate: openssl req -new -x509 -key private-key.pem -out certificate.pem -days 365
4. Fill out the prompt information as follows: 
	Country Name: CA, 
	State or Province: Alberta, 
	Locality: Calgary, 
	Organization Name: My company, 
	Organizational Unit: IT Department, 
	Common Name: localhost, 
	Email Address: youremail@example.com
5. Update certificate paths in the server.js file: 'path/to/private/key' = 'private-key.pem' & 'path/to/certificate' = 'certificate.pem'
6. Start the server to verify certificates: node server.js

## SSL Configuration
When we started to add SSL certificates to our project, we decided to follow the self-signed certificate process with OpenSSL. This is the method we were most comfortable with since we did an example activity with it in class. The process was pretty straightforward and we had little errors with this part of the assignment. The only issue we faced came from our own confusion when testing the secure and unsecure servers. When we would try to view the secure browser, it would give us an error. We thought that this was an issue on our part and kept retrying our code. Upon further research, and developing our understanding, we came to the realization that the error comes from OpenSSL and the self-signed certificates. It was not necessarily what we did in the code but rather the approach we decided to use. By adding these certificates, we are able to secure our webpage on a deeper level. Sensitive data like passwords and log-ins can be encrypted and secured. It gives our webpage a safety net and works to protect it from external and internal attacks. We added a helmet into our page in order to give it more security measures. Helmet brings in various headers that work to secure our code and files. These headers include CSP which ensures the scripts that run are directly from our server and random side ones. X-Frame-Options prevents external users from copying our code and hiding it in theirs. This will protect things like profile changes and log-in processes. Another header that was added is X-Content-Type which protects user data from being shared in the URL. 

## Caching Strategies
Since we chose to do a project sharing app, we felt it made sense to add routes that would reflect the functions and features of the app. 
1. GET /posts
- This allows the main feed of project images to appear and enables the users to refresh and scroll the content. 
- We made this route public since the main feed contains non-sensitive content.  
- We are caching this for 5 minutes, since posts might occasionally change, but not every second, which improves load times and speed.
- Stale-while-revalidating allows the server to refresh while the user views older data, making the app feel faster.  

2. GET /posts/:id
- Allows for individual posts to be retrieved by their given id.
- Each post is cached for 5 minutes, which allows for faster navigation and less repeated fetching.
- Short-term caching works since the post is not getting changed as frequently.
- Much like the main feed, this is made public since it only displays content and not private information. 

3. POST /posts
- This will allow for new content to be created and uploaded.
- In this route, we are using POST to create new data and prevent the new data from being reused. 
- No-store ensures that user information is not being stored or displayed anywhere. 

4. POST /posts/:id/like
- Allows for user interactions such as liking a post.
- Since likes are ever-changing, caching could cause inconsistencies and could be incorrectly reused.
- No-store prevents the browser from reusing dynamic actions.  

5. GET /posts/user/:id
- This combines both the profile and projects posted by a user. 
- The route is made public and will be revisited, so caching improves performance upon each visit. 
- A 5-minute cache is added to allow for speedy yet timely updates to a user's portfolio. 

## Lessons Learned 
We faced many challenges when it came to this assignment, a lot of which came from a gap in our understanding and knowledge of the subject. As stated above, our first issue came when we were trying to view our secure webpage in a browser. We assumed our code was wrong and ended up retrying it again and again with the same error message. After taking a step back and doing some further research, we discovered that our code was correct and it was our certificate method that was affecting our webpage. In order to solve this problem without entirely scratching our method, we were able to use the advanced settings in our browser to bypass the error and give us access to the webpage. Our certificates still remained in place and correct, we just had to complete an extra step!
As we continued working on the assignment, we found another problem when implementing HTTP headers. Since this is all new content to us, we did not understand what headers to include, or not include. It took us a while to comprehend what helmet actually does. After lots of research and trial and error, we came to a conclusion that when helmet is installed, it automatically provides the server with security measures. These measures are built into helmet’s code and should run as long as the server runs. 
When it came to writing the routes, we knew what kind of routes we wanted to add and what would be beneficial to our project idea. The hardest part was figuring out what caching strategies to add. We took a lot of time researching different strategies and what they all meant. Things like public versus private data and types of submitted data. We came to the conclusion that static files are unchanging thus the cache will be higher than dynamic files. The files that are always updating or refreshing require less cache in order to smoothly execute the desired function.  

# Phase 2

## Setting Up the Repository
1. Open terminal and type: git clone githubURL
2. Ensure you are working in the repo: cd repo name
3. Install required packages: Npm install express argon2 mongoose body-parser
4. Create .env file and include URL from MongoDB: MONGO_URI=yoururl
5. Run application: npm server.js
6. You should see: Server running on http://localhost:3000. Connected to MongoDB

## Authentication Mechanisms
Authentication is used to ensure the user accessing the system has the credentials to do so. We were able to do this in two ways. The first being a simple log in and log out function. The user is able to register with a username and password. We also gave them the option to use SSO through Google. We were able to hash the passwords using argon2. This adds a level of security for our users and protects their personal data. Through our authentication methods, we are able to dedicate route modules and use middleware to verify a user's identity. This protects our routes and ensures access is granted to those who have permission. 

## Role-Based Access Control
When it came to adding roles and permissions, we decided it was best to follow a role based access control (RBAC) approach. This made the most sense to us since our app requires users to have a profile as well as an admin to ensure backend information is running smoothly. The admin has permission to manage posts, users and view site analytics. We ensured that only admins can view this information by including roles within their parameters. As we progressed, we followed the same steps for users. These users can log in, create and edit their posts and view their own profile. This limits the user from accessing other users personal information and editing their profile. We were able to test these roles to ensure there was limited access, or no access, depending on who was logging in.   

## Lessons Learned
We had a few challenges when working on this phase of the assignment. The first challenge came when we had to connect to MongoDB. We came up with lots of errors that prevented us from not only being able to connect but also view any test data. Things like new users and admin log-ins could not be tested or viewed. We were able to take a step back and realize our error came from the url we were using to connect to MongoDb, Compass and our files. It was such a small error but once fixed, allowed us to view our test data and complete part A of the assignment. We also faced another challenge when connecting to Google as a SSO. We followed the steps given to us in one of the labs and were directed to the google log in page however, we were not able to actually log in. The page told us…  which is something we have seen before. The only way we knew to solve this issue was to change the port we had written in our .env file. After making this change we attempted the SSO again with no luck. Unfortunately with the given timeframe we had to move on from this step and was unable to fully solve the issue on our own. 
As we progressed through the assignment, we found that part B went smoothly whereas part C brought us more trouble. There was a gap in our understanding when it came to tokens and what to add to our code. We were able to use the RBAC lab to our advantage as it gave us some insight into tokens and how the code was written. Through loads of research and trial and error, we were able to get our tokens working and even trouble shooted it.    
The biggest challenge we faced was when we were implementing cookies and csrf. We discovered very early on that csrf is deprecated/archived. Everytime we tried to use it, we would get an error in our terminal. This caused us to have lots of frustration since csrf played a big role in part D of the assignment. After lots of trial and error we were able to get our code half working. When we tested our dashboard in the browser, everything worked; however,  postman was unable to execute the same functions. We also found that after adding the necessary code from part D, everything we did prior started to break. This section of the assignment caused us lots of stress and struggle. We had to make so many little changes that we ended up not fully understanding where our errors were coming from. As a result, we had to revert back to our original code prior to part D and stick with that. Everything we tried would just break and we could not move forward with csrf.  

# Phase 3

## Instructions 
1. Open terminal and type: git clone githubURL
2. Install required: npm install express-session express-validator ejs 
3. Add to Git Ignore: 
4. Ensure the following are in .env: 
	MONGO_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, PORT, JWT_SECRET, DB_CONNECTION, ENCRYPTION_SECRET
5. Run application: node server.js
6. You should see: Server running on http://localhost:3000. Connected to MongoDB

## Input validation techniques
When creating our form, we ensured to put caps or limits on the fields so that the only answers acceptable are the ones we decided to make valid. For example, we added limits to the name field. We stated that a user's name can only be between 3-50 characters long and must not contain numbers/special characters. This ensures that the only characters allowed in the name field are alphabetic. We are able to check this by including a .isalpha() in our code. This works to validate the input in the form and ensure it matches the criteria. If it doesn't, the form will not update/submit. We used this method in each of our form fields and changed the name to the respective field (ex .isLength() and .isEmail()). 
In our email field in the form, we wanted to ensure that the input submitted matched standard email formatting. We did this by stating that we are using type=”email” in our form/ This automatically searches for the email format that includes an @ sign and domain name ( @gmail.com etc). We also ensured the email formatting by including .isEmail() in our code. Like we stated above, this is used to ensure the field entered in the form matches email standards and does not contain restricted characters.
Lastly in our bio field in our form, we wanted the max amount of characters to be 500 and contain no special characters or html tags. We did this in a similar way to the name field. We put a cap on the characters allowed and restricted it to alphabetic characters. This gets checked using our .isLength() method as it works to ensure the field written in the form matches the criteria we gave it. By limiting the characters this field accepts, we can prevent attacks from being inputted into the field. Html is not accepted so any user trying to attack from the bio field will be unable to submit the form. 

## Output encoding methods
We used EJS as our primary method in our code. This works to take what could be dangerous characters and converts them into safer html elements. This becomes important especially when we have open form fields such as bio present. EJS acts as a protective barrier for SQL, XSS etc, attacks. It works to manipulate any dangerous responses in a field and protects the entire site from getting attacked. We also use an express-validator to sanitize our inputs. This does a similar thing to EJS where it converts any dangerous characters to plain text. It does this so any responses made in a  field are not executed in any way. This also prevents dangerous attacks from being stored before it is able to get sanitized. 

## Encryption techniques used
The main encryption technique we used comes from crypto. This can be seen in our email and bio sections of our javascript code. We wanted to encrypt sensitive user data so that it becomes protected when we store it. We did this by using crypto to encrypt the user data that gets submitted to in the form. Before this data gets stored, it gets encrypted which ensures it is never stored with just plain text. We then used decryption which only runs/works when the user needs to see their email or bio on display. This ensures only the user with the correct log in will be able to access sensitive user data like email and bio. We also used AES to further support or encrypt and decrypt codes. This ensures encrypted information is stored safely and in a way that cannot be accessed by just anyone. Our code and application also contains certificates which not only prevents interception but also encrypts data that gets passed between the user and server.  

## Third-party libraries dependency management
GitHub Actions workflow is designed to automatically check security vulnerabilities each time code is updated or on a scheduled basis.

“On:” section runs whenever there is a push or pull request to the main branch. This ensures all new code is checked before implementing into existing code. It also runs a weekly scheduled check using cron. 

“Jobs:” section shows the workflow runs on ‘ubuntu–latest’, a virtual Linux environment provided by GitHub, which allows the testing setup to be clean and consistent. 

“Steps:” section starts with ‘Checkout code’, which allows the workflow to have access to the project files by downloading the repository. Second is ‘Setup node’, where it installs the required Node.js version and caches dependencies to make future runs faster. Next is ‘Install dependencies’, where it uses npm ci to install packages from package-lock.json. Then,  ‘Run npm audit’ scans all dependencies for any security vulnerabilities. Lastly, ‘Attempt to fix vulnerabilities’ runs npm audit fix || true automatically, where it’s possible. Since || true is included, even though the fixing fails, the workflow continues.

## AI Tools Used:
We used ChatGPT to help us write the basic html and css pages for our forms. We took what the AI tool gave us and made changes to reflect our vision for our app. As we took a look at what chat gave us, we ensured the code it wrote matched what we have seen in the past. All the code we used from AI was code that we not only had seen before but also understood its purpose and function. If the code made no sense to us or we had never seen the technique before, we decided not to use it and try something else instead. We also used ChatGPT to write our GitHub Actions Workflow. We did not fully understand all the content that was added to this workflow so we only ended up keeping the parts that made sense to us. Anything that was confusing or lacked purpose in our eyes was removed.

## Lessons Learned: 
We found this assignment to be way smoother than the last one. We were able to resolve many of the issues we faced and were able to troubleshoot more effectively. That being said, we did have some issues throughout this phase that stumped us. The first issue being on getting all of our html and js pages to connect. We were able to log in as a user but when it came to accessing the dashboard, we got errors like GET /dashboard not found. This stumped us for a bit and had us rechecking our code. Through trial and error, and some minor research, we came to the conclusion that our dashboard route needed to be fixed as well as what code we used to connect our dashboard to our html form. We had to change our res.user to req.user. This change in our route allowed for the users log in information to be used to display our dashboard form. We were also able to use this information to get the users name to display in the welcome header. That part required a bit more brain power since we had to use EJS to authenticate the users information. EJS would double check that the user information is correct before allowing it to be displayed. This fix actually helped us solve another issue we had which was getting the log out button to end the users session. We were using res instead of req in our code which prevented the session from being severed. We took more time to understand the difference between res and req and how it affects the functionality of our code when it is used. 

The other problem we had was when we were trying to encrypt our email and bio inputs from the form. We could not figure out how to check if the encryption code was working or how to view it. This led us to having to do a lot of research about the code we had and the crypto library we were using. This is something we have never seen before so most of this code was trial and error. We had to go back into our past labs to see if anything helped us. As we reevaluated our code, we remembered using the password hashing lab and how we created regularuser. This gave us an idea and sent us down another rabbit hole of trial and error. We eventually came to the conclusion that our form has email and bio sections but mongoDB and postman were not expecting extra forms. With this, they had no where to store the information and didn't know what to do besides give us an error. We used postman to give our database a heads up on the data it was going to receive. After testing it with a new user, we were able to view the user in our database and see that the email and bio sections were fully encrypted.

The biggest problem came from part C in the assignment. We honestly had no clue where to begin in this section. The Actions workflow was something that neither of us had seen or heard of before and we had no clue how to approach it. We understood that we could use AI to help develop the workflow so that's where we started. We got ChatGPT to develop a workflow based on our code we had previously written. From there, we eliminated all the parts that made no sense to us. Once we were left with sections that made sense, we did further research and reading on what those sections meant. This was rather time consuming and led to us having to connect what we were learning to the code we had written. In the end we were able to come up with an action workflow that made the most sense to us. We understand that it might be missing sections or that there could be gaps in the understanding. This is a section that we would've taken more time researching/testing and furthering our understanding.  

