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
