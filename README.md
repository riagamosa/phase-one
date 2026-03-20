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